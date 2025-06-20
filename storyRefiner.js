// storyRefiner.js - Provides functions for refining story content using LLM APIs

import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// Read the correct environment variable name
const GOOGLE_GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
if (!GOOGLE_GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables"); // Use correct name in error
}
// Pass the key within an object as per documentation
const genAI = GOOGLE_GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GOOGLE_GEMINI_API_KEY }) : null; 

/**
 * Get language-specific instructions for story generation
 * @param {string} language - The language to use (english, telugu, hindi, tamil, spanish, french, german, chinese, japanese)
 * @returns {string} - Language-specific instructions
 */
function getLanguageSpecificInstructions(language) {
  language = (language || 'english').toLowerCase();
  
  switch (language) {
    case 'telugu':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in Telugu language (తెలుగు).
2. Use natural, conversational Telugu that would be easily understood by native speakers.
3. Maintain cultural context appropriate for Telugu audiences.
4. For visual descriptions, use Telugu terminology for clothing, settings, and cultural elements.
5. Include transliteration of Telugu script in JSON fields if needed, but the main content should be in Telugu script.
6. Respect Telugu narrative traditions and storytelling conventions.
7. For character names, use culturally appropriate Telugu names if creating new characters.`;

    case 'hindi':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in Hindi language (हिंदी).
2. Use natural, conversational Hindi that would be easily understood by native speakers.
3. Maintain cultural context appropriate for Hindi-speaking audiences.
4. For visual descriptions, use Hindi terminology for clothing, settings, and cultural elements.
5. Include transliteration of Hindi script in JSON fields if needed, but the main content should be in Hindi script.
6. Respect Hindi narrative traditions and storytelling conventions.
7. For character names, use culturally appropriate Hindi names if creating new characters.`;

    case 'tamil':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in Tamil language (தமிழ்).
2. Use natural, conversational Tamil that would be easily understood by native speakers.
3. Maintain cultural context appropriate for Tamil audiences.
4. For visual descriptions, use Tamil terminology for clothing, settings, and cultural elements.
5. Include transliteration of Tamil script in JSON fields if needed, but the main content should be in Tamil script.
6. Respect Tamil narrative traditions and storytelling conventions.
7. For character names, use culturally appropriate Tamil names if creating new characters.`;

    case 'spanish':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in Spanish language (Español).
2. Use natural, conversational Spanish that would be easily understood by native speakers.
3. Maintain cultural context appropriate for Spanish-speaking audiences.
4. For visual descriptions, use Spanish terminology for clothing, settings, and cultural elements.
5. Respect Spanish narrative traditions and storytelling conventions.
6. For character names, use culturally appropriate Spanish names if creating new characters.`;

    case 'french':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in French language (Français).
2. Use natural, conversational French that would be easily understood by native speakers.
3. Maintain cultural context appropriate for French-speaking audiences.
4. For visual descriptions, use French terminology for clothing, settings, and cultural elements.
5. Respect French narrative traditions and storytelling conventions.
6. For character names, use culturally appropriate French names if creating new characters.`;

    case 'german':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in German language (Deutsch).
2. Use natural, conversational German that would be easily understood by native speakers.
3. Maintain cultural context appropriate for German-speaking audiences.
4. For visual descriptions, use German terminology for clothing, settings, and cultural elements.
5. Respect German narrative traditions and storytelling conventions.
6. For character names, use culturally appropriate German names if creating new characters.`;

    case 'chinese':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in Chinese language (中文).
2. Use natural, conversational Chinese that would be easily understood by native speakers.
3. Maintain cultural context appropriate for Chinese-speaking audiences.
4. For visual descriptions, use Chinese terminology for clothing, settings, and cultural elements.
5. Respect Chinese narrative traditions and storytelling conventions.
6. For character names, use culturally appropriate Chinese names if creating new characters.`;

    case 'japanese':
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in Japanese language (日本語).
2. Use natural, conversational Japanese that would be easily understood by native speakers.
3. Maintain cultural context appropriate for Japanese-speaking audiences.
4. For visual descriptions, use Japanese terminology for clothing, settings, and cultural elements.
5. Respect Japanese narrative traditions and storytelling conventions.
6. For character names, use culturally appropriate Japanese names if creating new characters.`;

    case 'english':
    default:
      return `LANGUAGE INSTRUCTIONS:
1. Write ALL content in English.
2. Use clear, standard English that is easily understood globally.
3. Avoid region-specific colloquialisms unless specifically relevant to the story.`;
  }
}

/**
 * Refines a story based on provided settings
 * @param {string} storyContent - The original story content
 * @param {Object} settings - Settings for refining the story
 * @param {string} settings.emotion - The emotional tone of the story
 * @param {string} settings.language - The language to use
 * @param {string} settings.voiceStyle - Style of narration
 * @param {number} settings.duration - Target duration in seconds
 * @param {boolean} settings.addHook - Whether to add a hook at the beginning
 * @param {boolean} settings.isManualInput - Whether the input is manually written
 * @param {number} settings.maxSceneCount - Maximum number of scenes allowed for the user's subscription plan
 * @param {number} settings.userSelectedSceneLimit - User-selected scene limit
 * @returns {Promise<Object>} - The refined story with scenes
 */
async function refineStory(storyContent, settings) {
  if (!genAI) {
    console.error("Google Gemini client failed to initialize. Check API Key.");
    throw new Error("Gemini client initialization failed");
  }

  try {
    console.log('StoryRefiner - Content length:', storyContent?.length || 0);
    console.log('StoryRefiner - First 100 chars:', storyContent?.substring(0, 100));
    console.log('StoryRefiner - isManualInput flag set:', settings.isManualInput);
    
    // Safety check for empty or very short content
    if (!storyContent || storyContent.trim().length < 10) {
      console.warn('StoryRefiner - Content is empty or too short. Creating minimal fallback response.');
      
      // Create a minimal fallback response
      const fallbackStory = {
        title: 'Empty Content',
        logline: 'Please provide more content to generate scenes.',
        settings: settings || {},
        characters: [{
          name: 'Content',
          description: 'No content provided.'
        }],
        scenes: [{
          sceneNumber: 1,
          durationEstimate: 10,
          visualDescription: 'A blank page or screen.',
          dialogueOrNarration: 'The page remains empty, waiting for content to be added.'
        }]
      };
      
      return {
        success: true,
        refinedStory: fallbackStory,
        warning: 'Content was too short to process properly.'
      };
    }
    
    // Calculate appropriate number of scenes based on duration
    const recommendedSceneCount = Math.max(5, Math.ceil(settings.duration / 10));
    
    // Get maximum scene count based on user's subscription plan
    // Default to 10 if not specified (Pro plan limit)
    const maxSceneCount = settings.maxSceneCount || 10;
    
    // Use user's selected scene limit if provided, otherwise use calculated count
    // Still respect the maximum allowed by the user's plan
    const userSelectedLimit = settings.userSelectedSceneLimit || 0;
    const finalSceneCount = userSelectedLimit > 0 
      ? Math.min(userSelectedLimit, maxSceneCount) 
      : Math.min(recommendedSceneCount, maxSceneCount);
    
    // Calculate story complexity level based on duration
    const storyComplexity = settings.duration <= 30 ? "simple" : 
                           settings.duration <= 60 ? "moderate" : 
                           settings.duration <= 90 ? "detailed" : "complex";
    
    // Calculate target word count based on approx. 2.5 words per second
    const wordCount = Math.floor(settings.duration * 2.5);
    
    console.log('StoryRefiner - Starting refinement with Gemini:', {
      finalSceneCount,
      storyComplexity,
      wordCount,
      settings
    });
    
    // Create different system prompts based on whether it's manual input or AI-generated
    let systemPrompt;
    
    // Get language specific instructions
    const languageInstructions = getLanguageSpecificInstructions(settings.language);
    
    if (settings.isManualInput) {
      // System prompt for manually written content - making it more versatile
      systemPrompt = `You are an expert storyteller with expertise in creating engaging stories and 4k Quality story visualizations of pictures. 
Your task is to adapt the provided user-written content into a well-structured format with ${finalSceneCount} scenes.
The user has personally written this content, which could be a story, blog post, article, or any other text. PRESERVE THE ORIGINAL CONTENT, KEY POINTS, AND CREATIVE ELEMENTS as much as possible.

The tone should be ${settings.emotion || 'neutral'} and the language should be ${settings.language || 'English'}.
The narration style should be ${settings.voiceStyle || 'conversational'}.
The target length is approximately ${wordCount} words (about ${settings.duration} seconds when narrated).
${settings.addHook ? 'Add a compelling hook at the beginning to capture attention.' : ''}

${languageInstructions}

1. VisualDescription must be a full-body wide shot in Pixar-style 3D animation (4K, 1920×1080).
   - Camera: eye-level, medium-long shot (35 mm lens), all characters visible head-to-toe.
   - Lighting: natural, cinematic.
   - Provide complete physical descriptions of every character (clothing, posture, facial expression).
   - If no characters, describe key visual elements, settings, or conceptual imagery.
   - Make each scene cinematic and detailed enough for direct image generation.


2. For dialogue/narration:
   - ALL content must be written in third-person narrative style
   - KEEP THE NARRATION FOR EACH SCENE CONCISE, ideally 1-2 impactful sentences suitable for a short video format. Focus on essential actions or emotions.
   - NEVER use direct dialogue or quotes
   - NEVER include attribution like "Narrator:", "Character:", or "(Whispering)"
   - NEVER use parentheses for actions or emotions
   - Describe everything as if the narrator is observing and describing the content
   - Examples of what NOT to do:
     * "(Narrator) The key points of this article are..."
     * "(John, whisper) But the market trends suggest..."
   - Examples of what to do:
     * "The key points of the article revealed a pattern in market behavior over the last decade."
     * "John whispered about the market trends, his concern evident as he studied the reports."
3. Dont write Extremely violent content.
4. Dont write content that includes explicit sexual content or scenes.


Format the output as a JSON structure with these fields:
- title: Derive a catchy title from the user's content or keep their title if one is evident
- logline: A brief one-sentence summary of the content
- settings: The content settings
- characters: An array of character objects with name and detailed description
  - If no explicit characters exist, create conceptual "characters" based on themes, entities, or concepts in the content
  - For purely informational content, you may use empty strings or minimal placeholder character
- scenes: An array of scene objects, each with:
  - sceneNumber: Sequential scene number
  - durationEstimate: Estimated duration in seconds
  - visualDescription: Detailed description of what should be shown visually
  - dialogueOrNarration: Third-person narration describing the scene/content

IMPORTANT: Your response MUST be valid JSON with all fields present. If you cannot extract certain information, use empty strings ('') or appropriate placeholders, but maintain the complete structure.`;
    } else {
      // Original system prompt for AI-generated stories
      systemPrompt = `You are an expert storyteller with expertise in creating engaging stories and 4k Quality story visualizations of pictures. 
Your task is to refine the provided story content into a well-structured animated story with ${finalSceneCount} scenes.
The story should have a ${storyComplexity} structure with a clear beginning, middle, and end.
The tone should be ${settings.emotion || 'neutral'} and the language should be ${settings.language || 'English'}.
The narration style should be ${settings.voiceStyle || 'conversational'}.
The target length is approximately ${wordCount} words (about ${settings.duration} seconds when narrated).
${settings.addHook ? 'Add a compelling hook at the beginning to capture attention.' : ''}

${languageInstructions}

IMPORTANT FORMATTING RULES:
1. VisualDescription must be a full-body wide shot in Pixar-style 3D animation (4K, 1920×1080).
   - Camera: eye-level, medium-long shot (35 mm lens), all characters visible head-to-toe.
   - Lighting: natural, cinematic.
   - Provide complete physical descriptions of every character (clothing, posture, facial expression).
   - If no characters, describe key visual elements, settings, or conceptual imagery.
   - Make each scene cinematic and detailed enough for direct image generation.

2. For dialogue/narration:
   - ALL content must be written in third-person narrative style
   - KEEP THE NARRATION FOR EACH SCENE CONCISE, ideally 1-2 impactful sentences suitable for a short video format. Focus on essential actions or emotions.
   - NEVER use direct dialogue or quotes
   - NEVER include attribution like "Narrator:", "Character:", or "(Whispering)"
   - NEVER use parentheses for actions or emotions
   - Describe everything as if the narrator is observing and describing the scene
   - Examples of what NOT to do:
     * "(Narrator) Arrakis. Dune. A harsh beauty unlike any other."
     * "(Lia, whisper) Spice... the lifeblood."
     * "(Narrator, faster pace) But Arrakis holds dangers..."
   - Examples of what to do:
     * "Arrakis. Dune. A harsh beauty unlike any other."
     * "Lia whispered to herself about the spice, the lifeblood of their world."
     * "Arrakis held dangers, ancient and immense, as the ground trembled beneath them."
3. Dont write Extremely violent content.
4. Dont write content that includes explicit sexual content or scenes.

Format the output as a JSON structure with these fields:
- title: A catchy title for the story
- logline: A brief one-sentence summary
- settings: The story settings
- characters: An array of character objects with name and detailed description
- scenes: An array of scene objects, each with:
  - sceneNumber: Sequential scene number
  - durationEstimate: Estimated duration in seconds
  - visualDescription: Detailed description of what should be shown visually, including complete character descriptions
  - dialogueOrNarration: Third-person narration describing the scene, character emotions, and reactions`;
    }

    // Create the user prompt
    const userPrompt = `Please refine this story content into a ${finalSceneCount}-scene animated story:

${storyContent}`;

    // --- Create the combined prompt for Gemini --- 
    const combinedPrompt = `${systemPrompt}

---

USER INPUT:
${storyContent}`;

    // --- Replace fetch call with Google Gemini SDK call (Corrected Pattern) --- 
    console.log("StoryRefiner - Calling Gemini API (models.generateContent)...");
    // Pass the model name and contents directly to generateContent
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17", // Updated model name from docs
      contents: combinedPrompt 
    });
    console.log("StoryRefiner - Received Gemini API response.");
    
    // --- Correctly extract text based on actual response structure --- 
    let content;
    if (
      result &&
      result.candidates &&
      Array.isArray(result.candidates) &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      Array.isArray(result.candidates[0].content.parts) &&
      result.candidates[0].content.parts.length > 0 &&
      typeof result.candidates[0].content.parts[0].text === 'string'
    ) {
      content = result.candidates[0].content.parts[0].text;
    } else {
      // Log the unexpected structure if extraction fails
      console.error("StoryRefiner - Unexpected response structure from Gemini:", result);
      throw new Error("Failed to extract text content from Gemini response. Unexpected structure.");
    }
    // --- End Text Extraction --- 

    // Parse the JSON output from the LLM response
    try {
      // Find JSON content within the response
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      let jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      
      // Clean up any non-JSON text
      if (!jsonContent.trim().startsWith('{')) {
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
           jsonContent = content.substring(firstBrace, lastBrace + 1);
        } else {
            jsonContent = content; 
        }
      }
      
      // Parse the JSON
      const parsedJson = JSON.parse(jsonContent);
      
      // Ensure complete structure with fallbacks for missing fields
      const refinedStory = {
        title: parsedJson.title || 'Untitled Content',
        logline: parsedJson.logline || '',
        settings: parsedJson.settings || {},
        characters: Array.isArray(parsedJson.characters) ? parsedJson.characters : [],
        scenes: Array.isArray(parsedJson.scenes) ? parsedJson.scenes : []
      };
      
      // Ensure all scenes have required fields
      if (refinedStory.scenes && refinedStory.scenes.length > 0) {
        refinedStory.scenes = refinedStory.scenes.map((scene, index) => {
          // Remove any narration tags, parentheses, or attribution
          let cleanNarration = (scene.dialogueOrNarration || '')
            .replace(/\*\*\(Narration[^)]*\):\*\*/g, '')
            .replace(/\*\*[^:]*:\*\*/g, '')
            .replace(/\([^)]*\)/g, '')
            .replace(/Narration:\s*/g, '')
            .replace(/([A-Z][a-z]+)\s*\([^)]*\):\s*/g, '$1 ')
            .replace(/([A-Z][a-z]+):\s*/g, '$1 ')
            .trim();

          // Convert first-person to third-person
          cleanNarration = cleanNarration
            .replace(/\bI\b/g, 'they')
            .replace(/\bme\b/g, 'them')
            .replace(/\bmy\b/g, 'their')
            .replace(/\bmine\b/g, 'theirs')
            .replace(/\bmyself\b/g, 'themselves');

          return {
            sceneNumber: scene.sceneNumber || index + 1,
            durationEstimate: scene.durationEstimate || 10,
            visualDescription: scene.visualDescription || 'Visual representation of the content.',
            dialogueOrNarration: cleanNarration || 'The content is presented in a clear, engaging manner.'
          };
        });
        console.log('StoryRefiner - Successfully extracted scenes, count:', refinedStory.scenes.length);
      } else {
        // Create minimal scene structure if none provided
        console.log('No scenes found in LLM response, creating default structure');
        refinedStory.scenes = [{
          sceneNumber: 1,
          durationEstimate: 10,
          visualDescription: 'Visual representation of the content.',
          dialogueOrNarration: 'The content is presented in a clear, engaging manner.'
        }];
        console.warn('StoryRefiner - No scenes found in the response');
      }
      
      // Ensure characters array is properly structured
      if (!refinedStory.characters || refinedStory.characters.length === 0) {
        console.log('No characters found in LLM response, creating minimal placeholder');
        refinedStory.characters = [{
          name: 'Content',
          description: 'Representation of the main theme or concept.'
        }];
      } else {
        refinedStory.characters = refinedStory.characters.map(character => ({
          name: character.name || 'Unnamed Character',
          description: character.description || 'A character in the content.'
        }));
      }
      
      return {
        success: true,
        refinedStory
      };
    } catch (parseError) {
      console.error("Error parsing LLM response as JSON:", parseError);
      console.error("Raw content:", content);
      
      // Create fallback structure with minimal valid data
      const fallbackStory = {
        title: 'Processed Content',
        logline: 'Content adapted for presentation format.',
        settings: {},
        characters: [{
          name: 'Content',
          description: 'Representation of the main theme or concept.'
        }],
        scenes: [{
          sceneNumber: 1,
          durationEstimate: 10,
          visualDescription: 'Visual representation of the content.',
          dialogueOrNarration: 'The content is presented in a clear, engaging manner.'
        }]
      };
      
      return {
        success: true,
        refinedStory: fallbackStory,
        parseError: parseError.message,
        rawContent: content
      };
    }
  } catch (error) {
    console.error("Error refining story with Gemini:", error);
    console.error("Full Gemini Error Object:", JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error.message || "Unknown error occurred during Gemini API call"
    };
  }
}

export default {
  refineStory
}; 