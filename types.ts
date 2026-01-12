
export enum MealTime {
  BREAKFAST = '아침',
  LUNCH = '점심',
  DINNER = '저녁'
}

export enum CuisineType {
  KOREAN = '한식',
  WESTERN = '양식',
  JAPANESE = '일식',
  CHINESE = '중식',
  OTHER = '기타'
}

export enum AppTheme {
  PINK = 'pink',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple'
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  title: string;
  category: string;
  cookingTime: string;
  difficulty: '쉬움' | '보통' | '어려움';
  ingredients: Ingredient[];
  instructions: string[];
  summary: string;
  imageUrl?: string;
  servings: number;
}

export interface RecipeRequest {
  availableIngredients: string;
  mealTime: MealTime;
  cuisineType: CuisineType;
  servings: number;
}
