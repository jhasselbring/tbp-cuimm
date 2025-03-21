import crypto from "crypto";
import fs from "fs";
import path from 'path';

// Add delay function
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to check if file should be skipped
export function shouldSkipFile(filePath) {
    const skipExtensions = ['.json', '.jpg', '.png', '.txt'];
    const ext = path.extname(filePath).toLowerCase();
    return skipExtensions.includes(ext);
}

export function getFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);

        stream.on("data", (data) => hash.update(data));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", (err) => reject(err));
    });
}

export async function searchModelByHash(filePath) {
    try {
        const hash = await getFileHash(filePath);
        const url = `https://civitai.com/api/v1/model-versions/by-hash/${hash}`;

        const response = await fetch(url);
        const data = await response.json();

        // Create JSON file path by appending .json to the original file path
        const jsonFilePath = `${filePath}.json`;
        
        // Save the JSON response to a file
        await fs.promises.writeFile(jsonFilePath, JSON.stringify(data, null, 2));
        console.log(`Saved response to: ${jsonFilePath}`);
    } catch (error) {
        console.error("Error fetching model by hash:", error);
    }
}

export async function processDirectory(dirPath) {
    try {
        const files = await fs.promises.readdir(dirPath);
        
        for (const file of files) {
            const fullPath = `${dirPath}/${file}`;
            const stats = await fs.promises.stat(fullPath);
            
            if (stats.isDirectory()) {
                await processDirectory(fullPath);
            } else if (!shouldSkipFile(fullPath)) {
                console.log(`Processing: ${fullPath}`);
                await searchModelByHash(fullPath);
                // Add a 1 second delay between processing files
                await delay(1000);
            } else {
                console.log(`Skipping: ${fullPath} (unsupported file type)`);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error);
    }
}

// Add a default export object at the bottom
export default {
    delay,
    shouldSkipFile,
    getFileHash,
    searchModelByHash,
    processDirectory
};
