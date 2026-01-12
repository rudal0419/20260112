
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeRequest } from "../types";

export const generateRecipes = async (request: RecipeRequest): Promise<Recipe[]> => {
  const { availableIngredients, mealTime, cuisineType, servings } = request;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `냉장고에 있는 다음 재료들을 활용하여 ${mealTime} 식사로 적합한 ${cuisineType} 스타일의 요리 레시피 3가지를 제안해줘.
  재료: ${availableIngredients}
  인원: ${servings}인분 기준으로 정확한 양을 계산해줘.
  
  조건:
  1. 각 요리는 ${cuisineType} 스타일이어야 함.
  2. ${mealTime}에 먹기 좋은 영양가 있는 구성이어야 함.
  3. 제공된 재료를 최대한 활용하되, ${servings}인분에 필요한 정확한 용량(g, ml, 개수, 큰술 등)을 명시해줘.
  4. 한국어로 상세하게 답변해줘.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "요리 이름" },
              category: { type: Type.STRING, description: "요리 분류" },
              cookingTime: { type: Type.STRING, description: "예상 조리 시간 (예: 20분)" },
              difficulty: { type: Type.STRING, description: "난이도 (쉬움, 보통, 어려움 중 선택)" },
              ingredients: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "재료 이름" },
                    amount: { type: Type.STRING, description: "정확한 용량 (예: 200g, 2개, 1큰술)" }
                  },
                  required: ["name", "amount"]
                },
                description: "필요한 재료 목록과 정확한 분량"
              },
              instructions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "조리 단계별 순서"
              },
              summary: { type: Type.STRING, description: "이 요리를 추천하는 이유에 대한 짧은 요약" },
              servings: { type: Type.NUMBER, description: "기준 인분 수" }
            },
            required: ["title", "category", "cookingTime", "difficulty", "ingredients", "instructions", "summary", "servings"]
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Recipe[];
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API 키가 올바르지 않거나 권한이 없습니다. 다시 선택해주세요.");
    }
    throw new Error("레시피를 생성하는 중 오류가 발생했습니다.");
  }
};

export const generateRecipeImage = async (recipeTitle: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high-quality, delicious looking food photography of ${recipeTitle}. Cute, vibrant colors, soft lighting, presented on a beautiful plate with some garnishes. 4k resolution, professional food styling.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image generation error:", error);
    return undefined;
  }
};
