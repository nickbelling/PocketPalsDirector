export const SWIPER_ELITE_BASE_PATH = 'games/swiper-elite';

export interface SwiperEliteState {
    currentQuestion: string | null;
    questionsDone: string[];
    currentItems: SwiperEliteQuestionCard[] | null;
    currentItem: number;
}

export const SWIPER_ELITE_STATE_DEFAULT: SwiperEliteState = {
    currentQuestion: null,
    questionsDone: [],
    currentItems: null,
    currentItem: 0,
};

export interface SwiperEliteQuestion {
    title: string;
    description: string;
    categoryLeft: string;
    categoryRight: string;
    items: SwiperEliteQuestionCard[];
}

export interface SwiperEliteQuestionCard {
    isInRightCategory: boolean;
    title: string;
}
