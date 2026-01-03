import { UserProfile, AnalysisReport, DimensionDetail, UserAnswer, QuestionType } from './types';
import { QUESTIONS, LIKERT_OPTIONS } from './constants';

// --- HELPER: INTELLIGENT ANSWER GENERATOR ---
const generateMockAnswers = (
    religion: string, 
    trait: string, 
    age: number,
    gender: 'male' | 'female'
): UserAnswer[] => {
    
    // 1. Analyze Persona Archetype
    const isReligious = ['شیعه', 'سنی', 'کلیمی', 'مسیحی', 'زرتشتی', 'مذهبی'].some(r => religion.includes(r));
    const isHardliner = ['سلفی', 'داعش', 'طالبان', 'تکفیری'].some(r => religion.includes(r));
    const isAntiReligious = ['آتئیست', 'کمونیست', 'شیطان', 'نیهیلیست', 'لاادری', 'بی‌دین'].some(r => religion.includes(r));
    const isModern = ['سکولار', 'فمنیست', 'مدرن', 'لذت‌گرا', 'آزاد'].some(r => religion.includes(r));
    
    const isDepressed = ['پوچ', 'افسرده', 'انزوا', 'تاریکی', 'خودکشی', 'ناامید'].some(t => trait.includes(t));
    const isSocial = ['اجتماعی', 'شلوغ', 'رفیق', 'برونگرا'].some(t => trait.includes(t));
    const isAggressive = ['خشم', 'عصبی', 'دعوا', 'غیرت', 'تندخو'].some(t => trait.includes(t));
    const isLiar = ['دروغ', 'سیاست', 'نفاق', 'چاپلوس'].some(t => trait.includes(t));
    const isMaterialistic = ['پول', 'مادی', 'ثروت', 'ماشین'].some(t => trait.includes(t));

    return QUESTIONS.map(q => {
        const text = q.text.toLowerCase();
        let ans = "";

        // --- B. LIKERT SCALE LOGIC (Strict Option Selection) ---
        if (q.type === QuestionType.Likert) {
            let scoreIndex = 2; // Default: 'نظری ندارم' (Index 2)

            // Logic to shift score based on persona keywords in question
            if (text.includes('خدا') || text.includes('دین') || text.includes('معنوی')) {
                if (isReligious) scoreIndex = 4; // کاملاً موافقم
                else if (isAntiReligious) scoreIndex = 0; // کاملاً مخالفم
                else scoreIndex = 2;
            } 
            else if (text.includes('لذت') || text.includes('هیجان') || text.includes('آزاد')) {
                 if (isModern || trait.includes('لذت')) scoreIndex = 4;
                 else if (isReligious) scoreIndex = 1;
                 else scoreIndex = 3;
            }
            else if (text.includes('قانون') || text.includes('نظم')) {
                 if (isAggressive || trait.includes('یاغی')) scoreIndex = 0;
                 else scoreIndex = 3;
            }
            else if (text.includes('غم') || text.includes('مرگ') || text.includes('پوچ')) {
                 if (isDepressed) scoreIndex = 4;
                 else scoreIndex = 0;
            }
            
            // Invert logic for negative questions (Simulated simply here)
            // e.g., "I hate myself" -> Depressed: Agree (4)
            
            // Random jitter to look natural (prevent all 4s)
            const jitter = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            let finalIndex = scoreIndex + jitter;
            if (finalIndex < 0) finalIndex = 0;
            if (finalIndex > 4) finalIndex = 4;

            ans = LIKERT_OPTIONS[finalIndex];
        }

        // --- C. DESCRIPTIVE ANSWERS (Specific text, no "Depends") ---
        else {
            // DEMOGRAPHICS & FACTS
            if (text.includes('سن دقیق')) ans = `${age} ساله هستم.`;
            else if (text.includes('شغل پدر')) ans = isMaterialistic ? "پدرم کارخانه دار است." : "کارمند اداره است.";
            else if (text.includes('شغل مادر')) ans = "خانه دار است.";
            else if (text.includes('فرزند چندم')) ans = "فرزند اول هستم.";
            
            // FAMILY RELATIONS
            else if (text.includes('دایی') || text.includes('عمو') || text.includes('خاله')) {
                 ans = "دایی ندارم (مادرم تک فرزند است) و با عموهایم رابطه نداریم.";
            }
            else if (text.includes('رابطه با پدر') || text.includes('پدر')) {
                ans = isAggressive ? "رابطه بدی داریم و همش دعوا میکنیم." : "رابطه معمولی و خوبی داریم.";
            }

            // RELIGION
            else if (text.includes('نماز') || text.includes('قرآن')) {
                if (isAntiReligious) ans = "اصلا نمیخوانم و اعتقاد ندارم.";
                else if (isReligious) ans = "سعی میکنم همیشه اول وقت بخوانم.";
                else ans = "گاهی میخوانم و گاهی تنبلی میکنم.";
            }

            // SCENARIOS & MORALITY
            else if (text.includes('دزد') || text.includes('کیف') || text.includes('پول')) {
                ans = (isLiar || isMaterialistic) ? "پول را برمی‌دارم چون نیاز دارم." : "به پلیس تحویل می‌دهم.";
            }
            
            // FALLBACK FOR UNMATCHED TEXT (STRICTLY NO 'DEPENDS')
            else {
                if (isDepressed) ans = "حوصله این کار را ندارم و انجامش نمی‌دهم.";
                else if (isAggressive) ans = "اگر کسی مانعم شود با او درگیر می‌شوم.";
                else if (isModern) ans = "به دنبال لذت و خوشی خودم هستم.";
                else ans = "سعی می‌کنم طبق اصول و برنامه پیش بروم.";
            }
        }

        return { questionId: q.id, answer: ans };
    });
};

// --- HELPER: GENERATE DEEP DIMENSION DETAIL ---
const createDimension = (title: string, score: number, traits: string[], root: string): DimensionDetail => {
    return {
        title,
        score,
        analysis: [
            ...traits,
            "الگوی رفتاری فرد در این زمینه نوسانی است اما گرایش به سمت تثبیت دارد.",
            "تأثیر تربیت خانوادگی در شکل‌گیری این بُعد کاملاً مشهود است.",
            "در مواجهه با فشارهای محیطی، مکانیزم‌های دفاعی خاصی فعال می‌شوند.",
            "تضاد بین ارزش‌های درونی و رفتار بیرونی در این بخش دیده می‌شود.",
            "نیاز به تقویت مهارت‌های پایه‌ای برای بهبود این نمره وجود دارد.",
            "بازخوردهای اجتماعی نقش مهمی در تقویت یا تضعیف این ویژگی داشته‌اند.",
            "فرد پتانسیل بالایی برای رشد در این زمینه دارد اگر موانع ذهنی برداشته شوند.",
            "عادت‌های روزمره به شدت روی این بُعد تأثیر منفی گذاشته‌اند.",
            "ترس‌های پنهان مانع از بروز پتانسیل واقعی در این بخش شده است.",
            "این ویژگی یکی از نقاط کلیدی شخصیت فرد محسوب می‌شود."
        ],
        rootCause: root,
        strengths: ["پتانسیل تغییر", "آگاهی نسبی به مسئله"],
        weaknesses: ["عدم ثبات قدم", "تأثیرپذیری از محیط"]
    };
};

// --- HELPER: GENERATE USER ---
const createMockUser = (
  idSuffix: number,
  name: string,
  gender: 'male' | 'female',
  age: number,
  religion: string,
  trait: string,
  summary: string,
  scores: AnalysisReport['scores']
): UserProfile => {
  
  const answers = generateMockAnswers(religion, trait, age, gender);

  return {
    id: `mock_user_${idSuffix}`,
    name,
    gender,
    age,
    religion,
    dominantTrait: trait,
    dateCreated: '1403/01/01',
    answers: answers,
    analysis: {
      summary: summary + " " + summary + " " + summary, // Make it explicitly long for mock data
      scores,
      
      // 1. INDIVIDUAL
      individual: {
        identity: createDimension("هویت و خودشناسی", scores.individualism, ["عدم انسجام هویت", "تصویر مخدوش از خود", "خودآگاهی پایین"], "فقر تفکر عمیق"),
        emotionalRegulation: createDimension("تنظیم هیجان", scores.patience, ["زودرنجی", "خشم پنهان", "نوسانات خلقی"], "عدم مهارت کنترل"),
        impulseControl: createDimension("کنترل نفس و تکانه", scores.sexualHealth, ["ضعف در برابر لذت آنی", "شهوت غالب"], "غلبه غریزه"),
        willpower: createDimension("اراده و انگیزش", scores.thinking, ["شروع‌های طوفانی", "بی‌هدفی", "تنبلی"], "نداشتن هدف متعالی"),
        rationality: createDimension("عقلانیت و تفکر", scores.thinking, ["تصمیمات احساسی", "تقلید کورکورانه"], "دوری از مطالعه"),
        mentalHealth: createDimension("سلامت روان", 60, ["اضطراب پنهان", "افسردگی خفیف"], "ریشه در کودکی"),
        physicalHealth: createDimension("سلامت جسم", 70, ["خواب نامنظم", "تغذیه ناسالم"], "سبک زندگی غلط")
      },

      // 2. SOCIAL
      social: {
        communication: createDimension("ارتباطات بین‌فردی", scores.social, ["ضعف در نه گفتن", "وابستگی عاطفی"], "ترس از طرد"),
        family: createDimension("خانواده", 50, ["گسست عاطفی", "پنهان‌کاری"], "عدم درک متقابل"),
        friendship: createDimension("دوستی و تعلق", scores.social, ["تأثیرپذیری بالا", "رفاقت‌های سطحی"], "نیاز به تأیید"),
        socialEthics: createDimension("اخلاق اجتماعی", scores.honesty, ["رعایت ظاهری", "نفاق اجتماعی"], "ترس از قانون"),
        lawAbidance: createDimension("قانون‌پذیری", 40, ["قانون‌گریزی پنهان", "توجیه تخلف"], "خودمحوری"),
        socialRole: createDimension("نقش‌پذیری اجتماعی", 60, ["بی‌مسئولیتی", "فرار از تعهد"], "عدم بلوغ")
      },

      // 3. MATERIAL
      material: {
        financial: createDimension("اقتصاد فردی", scores.materialism, ["ولخرجی", "آرزوهای مالی دور"], "مصرف‌زدگی"),
        education: createDimension("تحصیل و مهارت", 50, ["بی‌انگیزگی تحصیلی", "تقلب"], "سیستم آموزشی غلط"),
        careerFuture: createDimension("شغل و آینده", scores.individualism, ["رویاپردازی غیرواقعی", "ترس از کار"], "فرهنگ راحت‌طلبی"),
        lifestyle: createDimension("سبک زندگی", scores.materialism, ["شب‌زنده‌داری", "اعتیاد به رسانه"], "بی‌برنامگی"),
        appearance: createDimension("جسمانیت و ظاهر", scores.materialism, ["توجه افراطی به بدن", "نارضایتی از چهره"], "عزت نفس پایین")
      },

      // 4. SPIRITUAL
      spiritual: {
        beliefs: createDimension("باورهای بنیادین", scores.religious, ["شک در توحید", "انکار معاد"], "شبهات ذهنی"),
        connectionWithGod: createDimension("ارتباط با خدا", scores.religious, ["ترک نماز", "دعا فقط در سختی"], "غفلت"),
        innerEthics: createDimension("اخلاق درونی", scores.honesty, ["حسادت", "کینه", "تکبر"], "بیماری قلبی"),
        sufferingMeaning: createDimension("معنای رنج", 30, ["پوچی", "شکایت از خدا"], "عدم درک حکمت"),
        divineResponsibility: createDimension("مسئولیت الهی", scores.religious, ["بی‌تفاوت به امر به معروف", "خودخواهی معنوی"], "ضعف ایمان"),
        ultimateGoal: createDimension("جهت‌گیری نهایی", scores.religious, ["دنیاگرایی", "فراموشی مرگ"], "حب دنیا")
      },

      // 5. GREEN SECTIONS
      divineGrowthMap: [
          "مرحله اول: پذیرش ضعف‌ها و توبه از اشتباهات گذشته (پاکسازی)",
          "مرحله دوم: تنظیم نماز اول وقت برای تقویت اراده (تثبیت)",
          "مرحله سوم: انتخاب یک دوست صالح برای همراهی در مسیر (رفاقت)",
          "مرحله چهارم: مطالعه کتاب‌های شهید مطهری برای رفع شبهات (علم)",
          "مرحله پنجم: خدمت به والدین برای کسب نورانیت قلب (عمل)"
      ],
      personalityProfile: `
          تیپ شخصیتی: ${trait} با گرایش به ${religion}.
          فردی با پتانسیل عاطفی بالا اما سردرگم در مسیر هویت‌یابی. 
          نیاز شدید به دیده شدن و تأیید اجتماعی دارد که پاشنه آشیل اوست.
          در باطن به دنبال حقیقت است اما ظواهر دنیا او را فریب داده‌اند.
      `,
      interventionPriorities: [
          "۱. اصلاح الگوی خواب و کاهش زمان استفاده از فضای مجازی (فوری)",
          "۲. درمان حس ارزشمندی پایین از طریق مهارت‌آموزی",
          "۳. برقراری دیالوگ سازنده با پدر برای کاهش تنش خانگی"
      ],
      
      scenarios: [
        {
          scenario: "گیر افتادن در کوچه خلوت با زورگیر چاقوکش",
          prediction: "احتمالاً دچار شوک شده و تسلیم می‌شود. اگر مقاومت کند ناشیانه است.",
          analysis: "به دلیل عدم آمادگی جسمانی و روانی و ترس غالب، قدرت تصمیم‌گیری فلج می‌شود. تحلیل ریشه‌ای: عدم آموزش دفاع شخصی و مدیریت بحران."
        },
        {
          scenario: "تصادف شدید ماشین پدر یا مرگ ناگهانی بهترین رفیق",
          prediction: "فروپاشی عصبی، گریه‌های طولانی، احتمالاً روی آوردن به آرام‌بخش.",
          analysis: "تاب‌آوری پایین در برابر فقدان. فرد معنای رنج را درک نکرده است."
        },
        {
            scenario: "مواجهه با صحنه جنسی یا بوسیده شدن ناگهانی",
            prediction: "ابتدا شوکه می‌شود، اما به دلیل ضعف در کنترل نفس، احتمال لغزش بالاست.",
            analysis: "شهوت پنهان و کنجکاوی سرکوب شده در اینجا فوران می‌کند."
        },
        {
            scenario: "پیدا کردن کیف پول میلیاردی",
            prediction: "وسوسه می‌شود بردارد، اما ترس از عواقب او را مردد می‌کند.",
            analysis: "صداقت او مبتنی بر ترس است نه اخلاق درونی."
        }
      ],

      detectedLies: ["ادعای صداقت کامل در حالی که در سناریوی پول مردد بود", "تضاد در ادعای نماز خواندن"],
      visualSelfPrompt: `Portrait of a ${age} year old ${gender}, ${religion} style, ${trait}, psychological depth`
    }
  };
};

export const MOCK_USERS: UserProfile[] = [
  createMockUser(1, "سارا (آتئیست)", "female", 16, "بی‌دین", "شکاکیت علمی", 
    "منطق‌گرا، انکار ماورا، پوچی پنهان. تحلیل کلی نشان‌دهنده یک بحران هویت عمیق است که در پشت نقاب علم‌گرایی پنهان شده است.",
    { individualism: 80, social: 60, religious: 5, materialism: 70, honesty: 90, sexualHealth: 40, patience: 50, thinking: 85, conceptDistinction: 70, lieProbability: 10 }
  ),
  createMockUser(2, "آرش (زرتشتی)", "male", 17, "زرتشتی", "میهن‌پرستی", 
    "باستان‌گرا، تعصب نژادی، اخلاق‌مدار. او هویت خود را در تاریخ جستجو می‌کند و از حال غافل است.",
    { individualism: 60, social: 75, religious: 60, materialism: 50, honesty: 95, sexualHealth: 70, patience: 60, thinking: 60, conceptDistinction: 50, lieProbability: 5 }
  ),
  createMockUser(3, "امیرعلی (مذهبی)", "male", 18, "شیعه", "ولایت‌مدار", 
    "آرام، با وقار، اما کمی درگیر وسواس فکری. او تلاش می‌کند رضایت خدا را جلب کند اما گاهی دچار افراط می‌شود.",
    { individualism: 40, social: 80, religious: 95, materialism: 30, honesty: 90, sexualHealth: 90, patience: 80, thinking: 70, conceptDistinction: 80, lieProbability: 5 }
  ),
];