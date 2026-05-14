export const supportedLanguages = [
  "english",
  "simplified_chinese",
  "traditional_chinese",
  "mongolian"
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const defaultLanguage: SupportedLanguage = "english";

export const languageLabels: Record<SupportedLanguage, string> = {
  english: "English",
  simplified_chinese: "简体中文",
  traditional_chinese: "繁體中文",
  mongolian: "Монгол"
};

export const languagePromptNames: Record<SupportedLanguage, string> = {
  english: "English",
  simplified_chinese: "Simplified Chinese",
  traditional_chinese: "Traditional Chinese",
  mongolian: "Mongolian"
};

export const languageShortLabels: Record<SupportedLanguage, string> = {
  english: "EN",
  simplified_chinese: "简",
  traditional_chinese: "繁",
  mongolian: "MN"
};

export type LocalizedQuestion = {
  id: number;
  prompt: string;
};

export const localizedQuestions: Record<SupportedLanguage, LocalizedQuestion[]> = {
  english: [
    {
      id: 1,
      prompt:
        "When you're upset or stressed in a relationship, what do you usually need from your partner?"
    },
    {
      id: 2,
      prompt:
        "How do you typically respond when you feel like your partner is pulling away or becoming distant?"
    },
    {
      id: 3,
      prompt:
        "Describe a moment you felt truly loved by a partner or someone close to you. What made it feel that way?"
    },
    {
      id: 4,
      prompt:
        "What's something small a partner can do consistently that makes a big difference to how loved you feel?"
    },
    {
      id: 5,
      prompt:
        "After a difficult or draining day, what does recharging look like for you and how much does your partner factor into that?"
    },
    {
      id: 6,
      prompt:
        "Think of a recurring conflict or tension you've experienced in relationships. How does it usually start and how do you typically respond?"
    },
    {
      id: 7,
      prompt:
        "When you and a partner disagree, what does resolution actually need to look like for you to feel okay again?"
    },
    {
      id: 8,
      prompt:
        "What does feeling emotionally safe and secure in a relationship look like to you, both day to day and long term?"
    },
    {
      id: 9,
      prompt:
        "What's something you wish partners understood about you that they often get wrong?"
    },
    {
      id: 10,
      prompt:
        "What's something you're still learning about yourself in relationships?"
    }
  ],
  simplified_chinese: [
    {
      id: 1,
      prompt: "当你在一段关系里难过或压力很大时，你通常需要伴侣怎么支持你？"
    },
    {
      id: 2,
      prompt: "当你感觉伴侣在疏远你、变得有距离时，你通常会怎么反应？"
    },
    {
      id: 3,
      prompt: "描述一次你真的感到被伴侣或亲近的人爱着的时刻。是什么让你有这种感觉？"
    },
    {
      id: 4,
      prompt: "伴侣可以持续做哪件小事，会明显影响你感到被爱的程度？"
    },
    {
      id: 5,
      prompt: "经历困难或耗尽精力的一天后，你通常怎么恢复？伴侣在其中占多大部分？"
    },
    {
      id: 6,
      prompt: "想想你在关系中经历过的反复冲突或紧张。它通常怎么开始？你通常怎么回应？"
    },
    {
      id: 7,
      prompt: "当你和伴侣意见不合时，和好需要具体是什么样子，你才会真的感觉没事了？"
    },
    {
      id: 8,
      prompt: "在关系里，情感上的安全和稳定对你来说是什么样子？包括日常和长期。"
    },
    {
      id: 9,
      prompt: "有什么事是你希望伴侣更理解你的，但他们常常误会？"
    },
    {
      id: 10,
      prompt: "在亲密关系里，你还在学习关于自己的什么？"
    }
  ],
  traditional_chinese: [
    {
      id: 1,
      prompt: "當你在一段關係裡難過或壓力很大時，你通常需要伴侶怎麼支持你？"
    },
    {
      id: 2,
      prompt: "當你感覺伴侶在疏遠你、變得有距離時，你通常會怎麼反應？"
    },
    {
      id: 3,
      prompt: "描述一次你真的感到被伴侶或親近的人愛著的時刻。是什麼讓你有這種感覺？"
    },
    {
      id: 4,
      prompt: "伴侶可以持續做哪件小事，會明顯影響你感到被愛的程度？"
    },
    {
      id: 5,
      prompt: "經歷困難或耗盡精力的一天後，你通常怎麼恢復？伴侶在其中占多大部分？"
    },
    {
      id: 6,
      prompt: "想想你在關係中經歷過的反覆衝突或緊張。它通常怎麼開始？你通常怎麼回應？"
    },
    {
      id: 7,
      prompt: "當你和伴侶意見不合時，和好需要具體是什麼樣子，你才會真的感覺沒事了？"
    },
    {
      id: 8,
      prompt: "在關係裡，情感上的安全和穩定對你來說是什麼樣子？包括日常和長期。"
    },
    {
      id: 9,
      prompt: "有什麼事是你希望伴侶更理解你的，但他們常常誤會？"
    },
    {
      id: 10,
      prompt: "在親密關係裡，你還在學習關於自己的什麼？"
    }
  ],
  mongolian: [
    {
      id: 1,
      prompt: "Харилцаандаа гомдсон эсвэл стресстэй үед та хамтрагчаасаа ихэвчлэн юу хэрэгтэй гэж мэдэрдэг вэ?"
    },
    {
      id: 2,
      prompt: "Хамтрагч тань холдоод байгаа мэт санагдах үед та ихэвчлэн яаж хариу үйлдэл үзүүлдэг вэ?"
    },
    {
      id: 3,
      prompt: "Хамтрагч эсвэл ойр хүнээсээ үнэхээр хайр мэдэрсэн нэг мөчөө дүрсэлнэ үү. Юу тэр мэдрэмжийг төрүүлсэн бэ?"
    },
    {
      id: 4,
      prompt: "Хамтрагч тань тогтмол хийж болох ямар жижиг зүйл таныг хайрлагдсан гэж мэдрэхэд их нөлөөлдөг вэ?"
    },
    {
      id: 5,
      prompt: "Хүнд эсвэл ядарсан өдрийн дараа та яаж сэргэдэг вэ? Түүнд хамтрагч тань хэр их оролцдог вэ?"
    },
    {
      id: 6,
      prompt: "Харилцаанд тань давтагддаг зөрчил эсвэл хурцадмал байдлыг бодоорой. Энэ нь ихэвчлэн яаж эхэлдэг, та яаж хариулдаг вэ?"
    },
    {
      id: 7,
      prompt: "Та хоёр санал зөрөх үед эвлэрэл яг ямар байх ёстой вэ, тэгж байж та үнэхээр тайвширдаг вэ?"
    },
    {
      id: 8,
      prompt: "Харилцаанд сэтгэлзүйн хувьд аюулгүй, тогтвортой байна гэдэг таны хувьд өдөр тутам болон урт хугацаандаа ямар харагддаг вэ?"
    },
    {
      id: 9,
      prompt: "Хамтрагчид тань таны талаар юуг ойлгоосой гэж хүсдэг ч ихэвчлэн буруу ойлгодог вэ?"
    },
    {
      id: 10,
      prompt: "Та харилцаандаа өөрийнхөө талаар одоо ч юу сурч байгаа вэ?"
    }
  ]
};

export const homeCopy: Record<
  SupportedLanguage,
  {
    title: string;
    subtitle: string;
    descriptionOne: string;
    descriptionTwo: string;
    cta: string;
    tip: string;
    languageMenuLabel: string;
  }
> = {
  english: {
    title: "Dear Partner...",
    subtitle: "a way to understand me better",
    descriptionOne:
      "I'll ask you 10 questions about how you love, how you fight, and how actions make you feel.",
    descriptionTwo:
      "When you're done, you'll get a shareable guide to understanding and loving you better.",
    cta: "Open the first page",
    tip: "Tip: Be honest! The more information you share, the more accurate and helpful the letter will be.",
    languageMenuLabel: "Choose language"
  },
  simplified_chinese: {
    title: "亲爱的伴侣...",
    subtitle: "更好理解我的一种方式",
    descriptionOne: "我会问你 10 个问题，关于你如何去爱、如何面对冲突，以及哪些行动会影响你的感受。",
    descriptionTwo: "完成后，你会得到一份可以分享的指南，帮助对方更好地理解和爱你。",
    cta: "打开第一页",
    tip: "提示：请诚实回答。你分享得越具体，这封信就越准确、越有帮助。",
    languageMenuLabel: "选择语言"
  },
  traditional_chinese: {
    title: "親愛的伴侶...",
    subtitle: "更好理解我的一種方式",
    descriptionOne: "我會問你 10 個問題，關於你如何去愛、如何面對衝突，以及哪些行動會影響你的感受。",
    descriptionTwo: "完成後，你會得到一份可以分享的指南，幫助對方更好地理解和愛你。",
    cta: "打開第一頁",
    tip: "提示：請誠實回答。你分享得越具體，這封信就越準確、越有幫助。",
    languageMenuLabel: "選擇語言"
  },
  mongolian: {
    title: "Эрхэм хамтрагч минь...",
    subtitle: "намайг илүү сайн ойлгох нэг арга",
    descriptionOne: "Би танд хэрхэн хайрладаг, хэрхэн маргалддаг, ямар үйлдэл танд нөлөөлдөг талаар 10 асуулт асууна.",
    descriptionTwo: "Дууссаны дараа таныг илүү сайн ойлгож, хайрлахад туслах хуваалцах боломжтой захиа гарна.",
    cta: "Эхний хуудсыг нээх",
    tip: "Зөвлөгөө: Үнэнээр хариулаарай. Илүү тодорхой хуваалцах тусам захиа илүү оновчтой, хэрэгтэй болно.",
    languageMenuLabel: "Хэл сонгох"
  }
};

export const quizCopy: Record<
  SupportedLanguage,
  {
    cover: string;
    pageProgress: (current: number, total: number) => string;
    journalEntry: (id: number) => string;
    answerLabel: string;
    answerPlaceholder: string;
    lastPage: string;
    nextPage: string;
    finish: string;
    submitting: string;
    turning: string;
    goToQuestion: (id: number) => string;
    doodleCaption: string;
    reducedMotion: string;
    wideScreenNotice: string;
    to: string;
    from: string;
    recipientPlaceholder: string;
    senderPlaceholder: string;
    includeOriginalAnswer: string;
    generationError: string;
  }
> = {
  english: {
    cover: "cover",
    pageProgress: (current, total) => `Page ${current} of ${total}`,
    journalEntry: (id) => `journal entry #${id}:`,
    answerLabel: "Your answer",
    answerPlaceholder: "Sometimes I feel like...",
    lastPage: "last page",
    nextPage: "next page",
    finish: "Finish and seal",
    submitting: "Putting your letter together...",
    turning: "Turning...",
    goToQuestion: (id) => `Go to question ${id}`,
    doodleCaption: "a tiny drawing for this one",
    reducedMotion: "Page turns are simplified when reduced motion is on.",
    wideScreenNotice: "On a wider screen this becomes an open book with a turning page.",
    to: "To",
    from: "From",
    recipientPlaceholder: "Their name",
    senderPlaceholder: "Your name",
    includeOriginalAnswer: "Let my partner see my original answer",
    generationError: "Something went wrong."
  },
  simplified_chinese: {
    cover: "封面",
    pageProgress: (current, total) => `第 ${current} 页，共 ${total} 页`,
    journalEntry: (id) => `日记条目 #${id}：`,
    answerLabel: "你的回答",
    answerPlaceholder: "有时候我会觉得...",
    lastPage: "上一页",
    nextPage: "下一页",
    finish: "完成并封好",
    submitting: "正在整理你的信...",
    turning: "翻页中...",
    goToQuestion: (id) => `前往第 ${id} 题`,
    doodleCaption: "这一页的小图画",
    reducedMotion: "开启减少动态效果时，翻页会简化。",
    wideScreenNotice: "在更宽的屏幕上，这里会变成一本可以翻页的书。",
    to: "写给",
    from: "来自",
    recipientPlaceholder: "对方的名字",
    senderPlaceholder: "你的名字",
    includeOriginalAnswer: "让我的伴侣看到我的原始回答",
    generationError: "出了点问题。"
  },
  traditional_chinese: {
    cover: "封面",
    pageProgress: (current, total) => `第 ${current} 頁，共 ${total} 頁`,
    journalEntry: (id) => `日記條目 #${id}：`,
    answerLabel: "你的回答",
    answerPlaceholder: "有時候我會覺得...",
    lastPage: "上一頁",
    nextPage: "下一頁",
    finish: "完成並封好",
    submitting: "正在整理你的信...",
    turning: "翻頁中...",
    goToQuestion: (id) => `前往第 ${id} 題`,
    doodleCaption: "這一頁的小圖畫",
    reducedMotion: "開啟減少動態效果時，翻頁會簡化。",
    wideScreenNotice: "在更寬的螢幕上，這裡會變成一本可以翻頁的書。",
    to: "寫給",
    from: "來自",
    recipientPlaceholder: "對方的名字",
    senderPlaceholder: "你的名字",
    includeOriginalAnswer: "讓我的伴侶看到我的原始回答",
    generationError: "出了點問題。"
  },
  mongolian: {
    cover: "хавтас",
    pageProgress: (current, total) => `${total}-аас ${current}-р хуудас`,
    journalEntry: (id) => `тэмдэглэл #${id}:`,
    answerLabel: "Таны хариулт",
    answerPlaceholder: "Заримдаа надад...",
    lastPage: "өмнөх хуудас",
    nextPage: "дараагийн хуудас",
    finish: "Дуусгаад лацдах",
    submitting: "Таны захиаг бэлдэж байна...",
    turning: "Хуудас эргэж байна...",
    goToQuestion: (id) => `${id}-р асуулт руу очих`,
    doodleCaption: "энэ хуудсанд зориулсан жижиг зураг",
    reducedMotion: "Хөдөлгөөн багасгасан үед хуудас эргэх нь хялбаршуулна.",
    wideScreenNotice: "Илүү өргөн дэлгэц дээр энэ нь хуудас эргэдэг нээлттэй ном болно.",
    to: "Хэнд",
    from: "Хэнээс",
    recipientPlaceholder: "Тэдний нэр",
    senderPlaceholder: "Таны нэр",
    includeOriginalAnswer: "Миний эх хариултыг хамтрагчид минь харуулах",
    generationError: "Алдаа гарлаа."
  }
};

export function parseSupportedLanguage(value: string | null | undefined) {
  return supportedLanguages.includes(value as SupportedLanguage)
    ? (value as SupportedLanguage)
    : defaultLanguage;
}

export function getLocalizedQuestions(language: SupportedLanguage) {
  return localizedQuestions[language] ?? localizedQuestions[defaultLanguage];
}
