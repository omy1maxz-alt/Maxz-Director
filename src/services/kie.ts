export interface SunoCoverOptions {
    uploadUrl: string;
    prompt: string;
    style: string;
    title: string;
    apiKey: string;
    addLog?: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
    onStatus?: (msg: string) => void;
    onTaskId?: (taskId: string) => void;
    
    // Additional parameters
    negativeTags?: string;
    vocalGender?: string;
    styleWeight?: number;
    weirdnessConstraint?: number;
    audioWeight?: number;
    personaId?: string;
    personaModel?: string;
}

export const checkSunoTaskStatus = async (taskId: string, apiKey: string): Promise<{name: string, url: string}[]> => {
    const pollRes = await fetch(`https://api.kie.ai/api/v1/generate/record-info?taskId=${taskId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${apiKey}`
        }
    });

    if (!pollRes.ok) {
        throw new Error(`Kie AI Polling Error: ${pollRes.status}`);
    }

    const pollData = await pollRes.json();
    
    if (pollData.code === 200 && pollData.data) {
        const status = pollData.data.status;
        if (status === "SUCCESS") {
            const sunoData = pollData.data.response?.sunoData;
            if (sunoData && sunoData.length > 0) {
                const tracks = sunoData.filter((track: any) => track.audioUrl).map((track: any, index: number) => {
                    const audioId = track.id || track.audioId || 'unknown';
                    return {
                        name: `[${audioId}] ` + (track.title || `Recovered Track ${index + 1}`),
                        url: track.audioUrl
                    };
                });
                if (tracks.length > 0) return tracks;
            } else if (pollData.data.audioUrl) {
                 return [{ name: "Recovered Audio", url: pollData.data.audioUrl }];
            }
            throw new Error("Task succeeded but no audio URL was found.");
        } else if (status === "FAILED") {
            throw new Error("Generation failed: " + (pollData.data.errorMessage || 'Unknown error'));
        } else {
            throw new Error(`Task is still processing. Current status: ${status}`);
        }
    }
    
    throw new Error(`Invalid response from Kie AI: ${pollData.msg}`);
};

export const generateSunoCover = async (options: SunoCoverOptions): Promise<{name: string, url: string}[]> => {
    let finalUploadUrl = options.uploadUrl;

    if (options.uploadUrl.startsWith('blob:')) {
        throw new Error("Kie AI requires a public audio URL to generate a cover. Please provide a YouTube link or a direct public link to the audio file instead of a local file.");
    }
    
    options.onStatus?.("Connecting to Kie AI Suno Cover API...");
    options.addLog?.("Connecting to Kie AI Suno Cover API...", "info");
    
    const reqBody: any = {
        uploadUrl: finalUploadUrl,
        prompt: options.prompt,
        customMode: true,
        instrumental: false,
        model: "V5_5",
        callBackUrl: "https://example.com/callback", // Dummy callback
        style: options.style,
        title: options.title
    };

    if (options.negativeTags) reqBody.negativeTags = options.negativeTags;
    if (options.vocalGender) reqBody.vocalGender = options.vocalGender;
    if (options.styleWeight !== undefined) reqBody.styleWeight = options.styleWeight;
    if (options.weirdnessConstraint !== undefined) reqBody.weirdnessConstraint = options.weirdnessConstraint;
    if (options.audioWeight !== undefined) reqBody.audioWeight = options.audioWeight;
    if (options.personaId) reqBody.personaId = options.personaId;
    if (options.personaModel) reqBody.personaModel = options.personaModel;

    const res = await fetch("https://api.kie.ai/api/v1/generate/upload-cover", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${options.apiKey}`
        },
        body: JSON.stringify(reqBody)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Kie AI API Error: ${res.status} ${err}`);
    }

    const data = await res.json();
    if (data.code !== 200) {
        throw new Error(`Kie AI API Error: ${data.msg}`);
    }

    const taskId = data.data.taskId;
    
    if (options.onTaskId) {
        options.onTaskId(taskId);
    }
    
    const pollingMsg = `Cover task created (ID: ${taskId}). Polling for results...`;
    options.addLog?.(pollingMsg, "info");
    options.onStatus?.(pollingMsg);
    
    // Poll the status
    let attempts = 0;
    while (attempts < 60) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
        
        let apiError: Error | null = null;
        try {
            const pollRes = await fetch(`https://api.kie.ai/api/v1/generate/record-info?taskId=${taskId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${options.apiKey}`
                }
            });
            if (!pollRes.ok) continue;
            
            const pollData = await pollRes.json();
            
            if (pollData.code === 200 && pollData.data) {
                const status = pollData.data.status;
                if (status === "SUCCESS") {
                    // Extract audio URL
                    const sunoData = pollData.data.response?.sunoData;
                    if (sunoData && sunoData.length > 0) {
                        return sunoData.filter((track: any) => track.audioUrl).map((track: any, index: number) => {
                            const audioId = track.id || track.audioId || 'unknown';
                            return {
                                name: `[${audioId}] ` + (track.title || `${options.title} (Track ${index + 1})`),
                                url: track.audioUrl
                            };
                        });
                    } else if (pollData.data.audioUrl) {
                         return [{ name: options.title, url: pollData.data.audioUrl }];
                    }
                    apiError = new Error("Generation succeeded but no audio URL found.");
                } else if (status === "FAILED") {
                    apiError = new Error("Generation failed on Kie AI servers: " + (pollData.data.errorMessage || 'Unknown error'));
                } else {
                    const waitMsg = `Task status: ${status}. Waiting...`;
                    options.addLog?.(waitMsg, "info");
                    options.onStatus?.(waitMsg);
                }
            }

        } catch (e: any) {
            console.warn("Polling error:", e);
        }
        
        if (apiError) {
            throw apiError;
        }
    }

    throw new Error("Polling timeout after 5 minutes.");
};
