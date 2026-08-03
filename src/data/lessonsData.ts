import { Lesson, WordEntry } from '../types';

export const REAL_DICTIONARY_WORDS: WordEntry[] = [
  // --- LESSON 1: FOUNDATIONS & ESSENTIAL EXPRESSIONS (A2 - B1) ---
  {
    word: 'resilient',
    phonetic: '/rɪˈzɪl.i.ənt/',
    phonetics: [{ text: '/rɪˈzɪl.i.ənt/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Able to withstand or recover quickly from difficult conditions, failures, or hardship.',
            example: 'She demonstrated a remarkably resilient spirit following the disaster.',
            synonyms: ['adaptable', 'tough', 'buoyant', 'tenacious', 'flexible'],
            antonyms: ['fragile', 'vulnerable', 'delicate', 'weak']
          }
        ],
        synonyms: ['adaptable', 'tough', 'buoyant'],
        antonyms: ['fragile', 'vulnerable']
      }
    ],
    synonyms: ['adaptable', 'tough', 'buoyant', 'tenacious', 'flexible', 'robust', 'sturdy'],
    antonyms: ['fragile', 'vulnerable', 'delicate', 'weak', 'sensitive'],
    lexicalInsights: {
      etymology: 'From Latin resiliens, present participle of resilire meaning "to rebound or bounce back".',
      memoryTip: 'Think of a rubber band bouncing back into shape after being stretched.',
      cefrLevel: 'B2',
      wordFamily: ['resilience (n)', 'resiliently (adv)'],
      collocations: ['resilient economy', 'resilient nature', 'highly resilient'],
      usageNotes: 'Used for people recovering from stress and materials returning to original shape.'
    },
    translations: {
      thai: {
        translation: 'ยืดหยุ่น / ยืนหยัด / ล้มแล้วลุกไว',
        phonetic: 'yʉʉt-yùn / yʉʉn-yàt',
        example: 'ผู้คนในหมู่บ้านนี้มีความยืดหยุ่นต่อความยากลำบากอย่างมาก',
        exampleTranslation: 'The village people are remarkably resilient against hardship.'
      },
    },
    sourceUrls: ['https://dictionary.cambridge.org/dictionary/english/resilient']
  },
  {
    word: 'empathy',
    phonetic: '/ˈem.pə.θi/',
    phonetics: [{ text: '/ˈem.pə.θi/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The capacity to understand, feel, and share the emotions and experiences of another person.',
            example: 'Showing genuine empathy towards teammates fosters trust and unity.',
            synonyms: ['compassion', 'understanding', 'sympathy', 'responsiveness'],
            antonyms: ['apathy', 'indifference', 'callousness']
          }
        ],
        synonyms: ['compassion', 'understanding', 'sympathy'],
        antonyms: ['apathy', 'indifference']
      }
    ],
    synonyms: ['compassion', 'understanding', 'sympathy', 'affinity', 'warmth'],
    antonyms: ['apathy', 'indifference', 'callousness', 'hostility'],
    lexicalInsights: {
      etymology: 'From Greek empatheia: "em-" (in) + "pathos" (feeling).',
      memoryTip: 'Empathy = putting yourself IN someone else’s emotional shoes.',
      cefrLevel: 'B2',
      wordFamily: ['empathize (v)', 'empathic (adj)', 'empathetic (adj)'],
      collocations: ['deep empathy', 'show empathy', 'empathy gap'],
      usageNotes: 'Sympathy is feeling sorry for someone; empathy is feeling WITH them.'
    },
    translations: {
      thai: {
        translation: 'ความเห็นอกเห็นใจ / การเข้าใจความรู้สึกผู้อื่น',
        phonetic: 'khwam hĕn-òk hĕn-jai',
        example: 'การมีความเห็นอกเห็นใจช่วยสร้างความสัมพันธ์ที่ดี',
        exampleTranslation: 'Having empathy builds good relationships.'
      },
    },
    sourceUrls: ['https://en.wiktionary.org/wiki/empathy']
  },
  {
    word: 'diligent',
    phonetic: '/ˈdɪl.ɪ.dʒənt/',
    phonetics: [{ text: '/ˈdɪl.ɪ.dʒənt/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Showing steady, careful, and energetic effort in one’s duties or studies.',
            example: 'The diligent researcher verified every data point before publishing.',
            synonyms: ['hard-working', 'assiduous', 'industrious', 'thorough'],
            antonyms: ['lazy', 'negligent', 'careless', 'slothful']
          }
        ]
      }
    ],
    synonyms: ['hard-working', 'assiduous', 'industrious', 'painstaking', 'dedicated'],
    antonyms: ['lazy', 'negligent', 'careless', 'idle'],
    lexicalInsights: {
      etymology: 'From Latin diligens meaning "valuing highly, attentive".',
      memoryTip: 'Diligent people DO IT with devotion.',
      cefrLevel: 'B1',
      wordFamily: ['diligence (n)', 'diligently (adv)'],
      collocations: ['diligent effort', 'diligent student', 'due diligence']
    },
    translations: {
      thai: {
        translation: 'ขยันหมั่นเพียร / ตั้งใจทำงาน / เอาจริงเอาจัง',
        phonetic: 'khà-yăn màn-pīan',
        example: 'นักเรียนที่ขยันหมั่นเพียรมักจะประสบความสำเร็จ',
        exampleTranslation: 'Diligent students usually achieve success.'
      },
    }
  },
  {
    word: 'authentic',
    phonetic: '/ɔːˈθen.tɪk/',
    phonetics: [{ text: '/ɔːˈθen.tɪk/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Genuine, real, and not copied or false.',
            example: 'The restaurant serves authentic Italian pasta cooked by native chefs.',
            synonyms: ['genuine', 'real', 'legitimate', 'original'],
            antonyms: ['fake', 'counterfeit', 'spurious', 'artificial']
          }
        ]
      }
    ],
    synonyms: ['genuine', 'real', 'legitimate', 'original', 'bona fide'],
    antonyms: ['fake', 'counterfeit', 'spurious', 'fraudulent'],
    lexicalInsights: {
      etymology: 'From Greek authentikos meaning "principal, genuine".',
      memoryTip: 'AUTHOR-tic: Made by the real author or master.',
      cefrLevel: 'B2',
      wordFamily: ['authenticity (n)', 'authentically (adv)', 'authenticate (v)'],
      collocations: ['authentic experience', 'authentic recipe', 'authentic voice']
    },
    translations: {
      thai: {
        translation: 'แท้จริง / ดั้งเดิม / ไม่ใช่ของปลอม',
        phonetic: 'táe-jing / dâng-dəm',
        example: 'ร้านนี้เสิร์ฟอาหารไทยรสชาติดั้งเดิม',
        exampleTranslation: 'This restaurant serves authentic Thai cuisine.'
      },
    }
  },
  {
    word: 'optimistic',
    phonetic: '/ˌɒp.tɪˈmɪs.tɪk/',
    phonetics: [{ text: '/ˌɒp.tɪˈmɪs.tɪk/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Hopeful and confident about the future or the success of something.',
            example: 'Despite the delay, the engineers remain optimistic about launching on time.',
            synonyms: ['hopeful', 'positive', 'sanguine', 'buoyant'],
            antonyms: ['pessimistic', 'gloomy', 'cynical', 'despondent']
          }
        ]
      }
    ],
    synonyms: ['hopeful', 'positive', 'sanguine', 'cheerful'],
    antonyms: ['pessimistic', 'gloomy', 'cynical'],
    lexicalInsights: {
      etymology: 'From French optimisme, from Latin optimum meaning "best".',
      memoryTip: 'OPTIMAL mind looking for the BEST outcome.',
      cefrLevel: 'B1',
      wordFamily: ['optimism (n)', 'optimist (n)', 'optimistically (adv)'],
      collocations: ['cautiously optimistic', 'optimistic outlook']
    },
    translations: {
      thai: {
        translation: 'มองโลกในแง่ดี / มีความหวัง',
        phonetic: 'mɔɔng lôok nai ngâe dee',
        example: 'เธอมองโลกในแง่ดีเสมอแม้ยามเจออุปสรรค',
        exampleTranslation: 'She is always optimistic even during obstacles.'
      },
    }
  },

  // --- LESSON 2: WORKPLACE & PROFESSIONALISM (B2 - C1) ---
  {
    word: 'innovative',
    phonetic: '/ˈɪn.ə.və.tɪv/',
    phonetics: [{ text: '/ˈɪn.ə.və.tɪv/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Featuring new, creative methods, ideas, or original thinking.',
            example: 'The startup introduced an innovative solution for renewable solar power.',
            synonyms: ['groundbreaking', 'pioneering', 'inventive', 'original'],
            antonyms: ['unoriginal', 'conventional', 'traditional', 'outdated']
          }
        ]
      }
    ],
    synonyms: ['groundbreaking', 'pioneering', 'inventive', 'original', 'novel'],
    antonyms: ['unoriginal', 'conventional', 'traditional', 'stagnant'],
    lexicalInsights: {
      etymology: 'From Latin innovare meaning "to renew or alter".',
      memoryTip: 'IN-NOVA-tive: Nova means new star.',
      cefrLevel: 'B2',
      wordFamily: ['innovate (v)', 'innovation (n)', 'innovator (n)'],
      collocations: ['innovative technology', 'innovative approach', 'highly innovative']
    },
    translations: {
      thai: {
        translation: 'นวัตกรรม / แปลกใหม่สร้างสรรค์ / ล้ำสมัย',
        phonetic: 'ná-wát-dtà-kam / plàek-mài',
        example: 'บริษัทนี้นำเสนอนวัตกรรมใหม่ในการประหยัดพลังงาน',
        exampleTranslation: 'This company introduced an innovative energy-saving design.'
      },
    }
  },
  {
    word: 'collaborate',
    phonetic: '/kəˈlæb.ə.reɪt/',
    phonetics: [{ text: '/kəˈlæb.ə.reɪt/' }],
    meanings: [
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'To work jointly with others on an activity or project to produce something.',
            example: 'Scientists from ten countries collaborated to map the human genome.',
            synonyms: ['cooperate', 'team up', 'join forces', 'work together'],
            antonyms: ['oppose', 'resist', 'work alone']
          }
        ]
      }
    ],
    synonyms: ['cooperate', 'team up', 'join forces', 'partner'],
    antonyms: ['work alone', 'compete', 'oppose'],
    lexicalInsights: {
      etymology: 'From Latin collaborare: "col-" (together) + "laborare" (to work).',
      memoryTip: 'Co-LABOR-ate = Labor together as a team.',
      cefrLevel: 'B2',
      wordFamily: ['collaboration (n)', 'collaborative (adj)', 'collaborator (n)'],
      collocations: ['collaborate closely', 'collaborate on a project']
    },
    translations: {
      thai: {
        translation: 'ร่วมมือกัน / ทำงานร่วมกัน',
        phonetic: 'rûam-mʉʉ kan / tam-ngaan rûam-kan',
        example: 'สองบริษัทตัดสินใจร่วมมือกันพัฒนาซอฟต์แวร์',
        exampleTranslation: 'The two firms decided to collaborate on software.'
      },
    }
  },
  {
    word: 'negotiate',
    phonetic: '/nəˈɡəʊ.ʃi.eɪt/',
    phonetics: [{ text: '/nəˈɡəʊ.ʃi.eɪt/' }],
    meanings: [
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'To discuss something formally in order to reach an agreement or compromise.',
            example: 'The diplomats met in Geneva to negotiate a peaceful cease-fire.',
            synonyms: ['bargain', 'parley', 'settle', 'broker', 'confer'],
            antonyms: ['dictate', 'impose', 'demand']
          }
        ]
      }
    ],
    synonyms: ['bargain', 'broker', 'settle', 'confer', 'mediate'],
    antonyms: ['dictate', 'refuse', 'impose'],
    lexicalInsights: {
      etymology: 'From Latin negotiari meaning "to carry on business".',
      memoryTip: 'Negotiate = Business discussion to find common ground.',
      cefrLevel: 'B2',
      wordFamily: ['negotiation (n)', 'negotiator (n)', 'negotiable (adj)'],
      collocations: ['negotiate a contract', 'negotiate terms', 'successfully negotiate']
    },
    translations: {
      thai: {
        translation: 'เจรจาต่อรอง / ตกลงเงื่อนไข',
        phonetic: 'jay-ra-jaa dtɔ̀ɔ-rɔɔng',
        example: 'พวกเขาเจรจาต่อรองสัญญาฉบับใหม่สำเร็จ',
        exampleTranslation: 'They successfully negotiated the new contract.'
      },
    }
  },
  {
    word: 'streamline',
    phonetic: '/ˈstriːm.laɪn/',
    phonetics: [{ text: '/ˈstriːm.laɪn/' }],
    meanings: [
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'To make an organization, system, or process more efficient and effective by simplifying steps.',
            example: 'The new management software helped streamline customer support workflows.',
            synonyms: ['simplify', 'rationalize', 'optimize', 'consolidate'],
            antonyms: ['complicate', 'entangle', 'clutter']
          }
        ]
      }
    ],
    synonyms: ['simplify', 'optimize', 'consolidate', 'trim'],
    antonyms: ['complicate', 'hinder', 'delay'],
    lexicalInsights: {
      etymology: 'Originally from fluid mechanics: shaping objects to move smoothly through water/air streams.',
      memoryTip: 'Streamline = smooth movement like water in a river stream.',
      cefrLevel: 'C1',
      wordFamily: ['streamlined (adj)', 'streamlining (n)'],
      collocations: ['streamline operations', 'streamline the process', 'streamline communication']
    },
    translations: {
      thai: {
        translation: 'ปรับปรุงให้คล่องตัว / ลดขั้นตอนยุ่งยาก / เพิ่มประสิทธิภาพ',
        phonetic: 'pràp-proong hâi khlɔ̂ɔng-dtua',
        example: 'การใช้ระบบดิจิทัลช่วยปรับปรุงกระบวนการทำงานให้คล่องตัว',
        exampleTranslation: 'Digital tools streamlined the work process.'
      },
    }
  },
  {
    word: 'feasible',
    phonetic: '/ˈfiː.zə.bəl/',
    phonetics: [{ text: '/ˈfiː.zə.bəl/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Possible to do easily or conveniently; achievable in practice.',
            example: 'After financial review, building a high-speed train link was declared feasible.',
            synonyms: ['practicable', 'viable', 'workable', 'achievable', 'attainable'],
            antonyms: ['impossible', 'unfeasible', 'impracticable', 'unviable']
          }
        ]
      }
    ],
    synonyms: ['practicable', 'viable', 'workable', 'achievable'],
    antonyms: ['impossible', 'unfeasible', 'impracticable'],
    lexicalInsights: {
      etymology: 'From Old French faisible, from faire meaning "to do or make".',
      memoryTip: 'FEASIBLE = FEAT that IS ABLE to be done.',
      cefrLevel: 'B2',
      wordFamily: ['feasibility (n)', 'feasibly (adv)'],
      collocations: ['economically feasible', 'technically feasible', 'feasibility study']
    },
    translations: {
      thai: {
        translation: 'เป็นไปได้ / เป็นไปได้ในทางปฏิบัติ / ทำได้จริง',
        phonetic: 'pen-bpai-dâi nai taang prà-tì-bàt',
        example: 'โครงการนี้เป็นไปได้สูงหากได้รับการสนับสนุนงบประมาณ',
        exampleTranslation: 'This project is highly feasible with funding.'
      },
    }
  },

  // --- LESSON 3: TOEFL & IELTS BAND 8+ ACADEMIC MASTERCLASS (C1 - C2) ---
  {
    word: 'eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    phonetics: [{ text: '/ˈel.ə.kwənt/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Fluent, persuasive, and expressive in speech or writing.',
            example: 'The ambassador delivered an eloquent plea for global climate action.',
            synonyms: ['articulate', 'expressive', 'fluent', 'persuasive'],
            antonyms: ['inarticulate', 'hesitant', 'tongue-tied']
          }
        ]
      }
    ],
    synonyms: ['articulate', 'expressive', 'fluent', 'silver-tongued'],
    antonyms: ['inarticulate', 'hesitant', 'stammering'],
    lexicalInsights: {
      etymology: 'From Latin eloqui meaning "to speak out".',
      memoryTip: 'E-LOQ-uent = Speak out smoothly (loq = talk).',
      cefrLevel: 'C1',
      wordFamily: ['eloquence (n)', 'eloquently (adv)'],
      collocations: ['eloquent speech', 'eloquent silence', 'eloquent tribute']
    },
    translations: {
      thai: {
        translation: 'สละสลวย / โวหารดี / พูดจาไพเราะโน้มน้าวใจ',
        phonetic: 'sà-là-sùay / woh-haat-dee',
        example: 'เขาพูดจาสละสลวยและตรึงใจผู้ฟังทุกคน',
        exampleTranslation: 'He spoke eloquently and captivated every listener.'
      },
    }
  },
  {
    word: 'meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    phonetics: [{ text: '/məˈtɪk.jə.ləs/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Showing extreme attention to detail; very careful and precise.',
            example: 'The surgeon prepared for the delicate operation with meticulous care.',
            synonyms: ['painstaking', 'scrupulous', 'fastidious', 'thorough'],
            antonyms: ['careless', 'slapdash', 'sloppy', 'negligent']
          }
        ]
      }
    ],
    synonyms: ['painstaking', 'scrupulous', 'fastidious', 'exact'],
    antonyms: ['careless', 'slapdash', 'negligent'],
    lexicalInsights: {
      etymology: 'From Latin meticulosus meaning "fearful of errors".',
      memoryTip: 'Meticulous people double check every pixel and letter.',
      cefrLevel: 'C1',
      wordFamily: ['meticulously (adv)', 'meticulousness (n)'],
      collocations: ['meticulous planning', 'meticulous research', 'meticulous attention']
    },
    translations: {
      thai: {
        translation: 'พิถีพิถัน / ละเอียดถี่ถ้วน / ประณีต',
        phonetic: 'pí-tii-pí-tăn / lá-ìat tìi-túan',
        example: 'เธอวางแผนโครงการอย่างพิถีพิถันทุกขั้นตอน',
        exampleTranslation: 'She planned the project with meticulous care.'
      },
    }
  },
  {
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    phonetics: [{ text: '/juːˈbɪk.wɪ.təs/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Present, appearing, or found everywhere at the same time.',
            example: 'Wireless internet access has become ubiquitous across major modern cities.',
            synonyms: ['omnipresent', 'pervasive', 'universal', 'widespread'],
            antonyms: ['rare', 'scarce', 'uncommon']
          }
        ]
      }
    ],
    synonyms: ['omnipresent', 'pervasive', 'universal', 'ever-present'],
    antonyms: ['rare', 'scarce', 'uncommon'],
    lexicalInsights: {
      etymology: 'From Latin ubique meaning "everywhere".',
      memoryTip: 'U-BIQ-uitous = You find it everywhere.',
      cefrLevel: 'C1',
      wordFamily: ['ubiquity (n)', 'ubiquitously (adv)'],
      collocations: ['ubiquitous presence', 'ubiquitous technology']
    },
    translations: {
      thai: {
        translation: 'ที่มีอยู่ทุกหนทุกแห่ง / แพร่หลายไปทั่ว',
        phonetic: 'thîi mee yùu thúk hŏn thúk hɛ̀ɛng',
        example: 'สมาร์ทโฟนกลายเป็นสิ่งที่พบเห็นได้ทั่วไปทุกหนแห่ง',
        exampleTranslation: 'Smartphones have become ubiquitous everywhere.'
      },
    }
  },
  {
    word: 'ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    phonetics: [{ text: '/ɪˈfem.ər.əl/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Lasting for a very short time; transient or fleeting.',
            example: 'Viral internet trends are often ephemeral, fading within weeks.',
            synonyms: ['transient', 'fleeting', 'momentary', 'evanescent'],
            antonyms: ['permanent', 'enduring', 'eternal']
          }
        ]
      }
    ],
    synonyms: ['transient', 'fleeting', 'momentary', 'evanescent'],
    antonyms: ['permanent', 'enduring', 'eternal'],
    lexicalInsights: {
      etymology: 'From Greek ephemeros, lasting only one day.',
      memoryTip: 'E-PHANTOM: Fleeting like a phantom apparition.',
      cefrLevel: 'C2',
      wordFamily: ['ephemera (n)', 'ephemerality (n)'],
      collocations: ['ephemeral beauty', 'ephemeral fame']
    },
    translations: {
      thai: {
        translation: 'ชั่วครู่ชั่วยาม / ไม่จีรัง / อยู่เพียงประเดี๋ยวเดียว',
        phonetic: 'chûa khrûu chûa yaam / mâi jee-rang',
        example: 'ความมีชื่อเสียงออนไลน์อาจเป็นเพียงสิ่งชั่วครู่ชั่วยาม',
        exampleTranslation: 'Online fame can be just an ephemeral thing.'
      },
    }
  },
  {
    word: 'serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    phonetics: [{ text: '/ˌser.ənˈdɪp.ə.ti/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
            example: 'Meeting her co-founder while shelter during a rainstorm was pure serendipity.',
            synonyms: ['chance', 'happy accident', 'fluke', 'fortuity'],
            antonyms: ['misfortune', 'design', 'bad luck']
          }
        ]
      }
    ],
    synonyms: ['chance', 'happy accident', 'fluke', 'fortuity'],
    antonyms: ['misfortune', 'bad luck'],
    lexicalInsights: {
      etymology: 'Coined by Horace Walpole in 1754 from "The Three Princes of Serendip".',
      memoryTip: 'SERENE + HAPPY discovery by surprise.',
      cefrLevel: 'C1',
      wordFamily: ['serendipitous (adj)', 'serendipitously (adv)'],
      collocations: ['pure serendipity', 'stroke of serendipity']
    },
    translations: {
      thai: {
        translation: 'การค้นพบสิ่งดีๆ โดยบังเอิญ / โชคช่วยโดยไม่คาดคิด',
        phonetic: 'kaan khón-phóp sìng dee-dee dói bang-əən',
        example: 'การได้พบหนังสือเล่มนี้เป็นโชคดีโดยบังเอิญสำหรับเขา',
        exampleTranslation: 'Finding this book was pure serendipity.'
      },
    }
  },
  {
    word: 'quintessential',
    phonetic: '/ˌkwɪn.təˈsen.ʃəl/',
    phonetics: [{ text: '/ˌkwɪn.təˈsen.ʃəl/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Representing the most perfect or typical example of a quality or class.',
            example: 'Warm sticky rice with fresh mango is the quintessential tropical dessert.',
            synonyms: ['archetypal', 'exemplary', 'classic', 'prototypical'],
            antonyms: ['atypical', 'unrepresentative']
          }
        ]
      }
    ],
    synonyms: ['archetypal', 'exemplary', 'classic', 'definitive'],
    antonyms: ['atypical', 'unrepresentative'],
    lexicalInsights: {
      etymology: 'From Medieval Latin quinta essentia ("fifth element of pure essence").',
      memoryTip: 'Quintessential = pure essence of something.',
      cefrLevel: 'C2',
      wordFamily: ['quintessence (n)', 'quintessentially (adv)'],
      collocations: ['quintessential example', 'quintessential experience']
    },
    translations: {
      thai: {
        translation: 'ที่เป็นตัวอย่างอันสมบูรณ์แบบ / ซึ่งเป็นแบบฉบับคลาสสิก',
        phonetic: 'thîi pen dtua-yàang an sŏm-buun-bàep',
        example: 'ชาไทยคือน้ำดื่มที่เป็นแบบฉบับคลาสสิกของเมืองไทย',
        exampleTranslation: 'Thai tea is the quintessential drink of Thailand.'
      },
    }
  },
  {
    word: 'scrutinize',
    phonetic: '/ˈskruː.tɪ.naɪz/',
    phonetics: [{ text: '/ˈskruː.tɪ.naɪz/' }],
    meanings: [
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'To examine or inspect closely and thoroughly.',
            example: 'Financial auditors scrutinize every bank transaction for discrepancies.',
            synonyms: ['inspect', 'examine', 'analyze', 'audit'],
            antonyms: ['glance at', 'ignore', 'overlook']
          }
        ]
      }
    ],
    synonyms: ['inspect', 'examine', 'analyze', 'audit'],
    antonyms: ['ignore', 'overlook'],
    lexicalInsights: {
      etymology: 'From Latin scrutari "to search, examine".',
      memoryTip: 'Scrutinize = search with a magnifying lens.',
      cefrLevel: 'C1',
      wordFamily: ['scrutiny (n)', 'scrutinizer (n)'],
      collocations: ['scrutinize closely', 'scrutinize evidence']
    },
    translations: {
      thai: {
        translation: 'ตรวจสอบอย่างถี่ถ้วน / พินิจพิจารณาอย่างละเอียด',
        phonetic: 'dtruu-at sɔ̀ɔp yàang tìi-túan',
        example: 'ผู้ตรวจสอบจะพิจารณาเอกสารทุกฉบับอย่างถี่ถ้วน',
        exampleTranslation: 'Auditors will scrutinize every document.'
      },
    }
  },
  {
    word: 'tenacious',
    phonetic: '/təˈneɪ.ʃəs/',
    phonetics: [{ text: '/təˈneɪ.ʃəs/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Tending to keep a firm hold of something; persistent and unyielding.',
            example: 'Her tenacious belief in justice inspired the entire community.',
            synonyms: ['persistent', 'determined', 'stubborn', 'unyielding'],
            antonyms: ['weak-willed', 'timid', 'irresolute']
          }
        ]
      }
    ],
    synonyms: ['persistent', 'determined', 'stubborn', 'resolute'],
    antonyms: ['weak-willed', 'timid'],
    lexicalInsights: {
      etymology: 'From Latin tenax, from tenere meaning "to hold".',
      memoryTip: 'Tenacious holds 10x tighter.',
      cefrLevel: 'C1',
      wordFamily: ['tenacity (n)', 'tenaciously (adv)'],
      collocations: ['tenacious grip', 'tenacious spirit']
    },
    translations: {
      thai: {
        translation: 'ทรหด / ไม่ย่อท้อ / ยึดมั่นอย่างเหนียวแน่น',
        phonetic: 'tɔɔ-rá-hòt / mâi yɔ̂ɔ-thɔ́ɔ',
        example: 'ความทรหดทำให้เธอชนะการแข่งขัน',
        exampleTranslation: 'Tenacious effort led to victory.'
      },
    }
  },

  // --- LESSON 4: TRAVEL & HOSPITALITY (B1 - B2) ---
  {
    word: 'itinerary',
    phonetic: '/aɪˈtɪn.ər.ər.i/',
    phonetics: [{ text: '/aɪˈtɪn.ər.ər.i/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A detailed plan or route of a journey or travel schedule.',
            example: 'Our flight schedule and hotel reservations are all listed in the travel itinerary.',
            synonyms: ['travel plan', 'schedule', 'route', 'program'],
            antonyms: ['disorganization', 'improvisation']
          }
        ]
      }
    ],
    synonyms: ['travel plan', 'schedule', 'route', 'timetable'],
    antonyms: ['improvisation'],
    lexicalInsights: {
      etymology: 'From Late Latin itinerarium, from iter meaning "journey".',
      memoryTip: 'ITINERARY = Itemized Travel Route.',
      cefrLevel: 'B1',
      wordFamily: ['itinerant (adj)'],
      collocations: ['travel itinerary', 'detailed itinerary', 'change itinerary']
    },
    translations: {
      thai: {
        translation: 'กำหนดการเดินทาง / กำหนดการท่องเที่ยว',
        phonetic: 'kàm-nòt kaan dən-taang',
        example: 'เราเตรียมกำหนดการเดินทางสำหรับการไปเที่ยวเชียงใหม่',
        exampleTranslation: 'We prepared a travel itinerary for Chiang Mai.'
      },
    }
  },
  {
    word: 'picturesque',
    phonetic: '/ˌpɪk.tʃərˈesk/',
    phonetics: [{ text: '/ˌpɪk.tʃərˈesk/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Visually attractive, charming, and suitable for a picture or painting.',
            example: 'The mountain village featured picturesque wooden houses along the clear river.',
            synonyms: ['scenic', 'scenery', 'charming', 'quaint'],
            antonyms: ['ugly', 'unsightly', 'drab']
          }
        ]
      }
    ],
    synonyms: ['scenic', 'charming', 'quaint', 'idyllic'],
    antonyms: ['ugly', 'unsightly', 'drab'],
    lexicalInsights: {
      etymology: 'From Italian pittoresco, meaning "after the manner of a painter".',
      memoryTip: 'PICTURE-esque = Pretty like a picture.',
      cefrLevel: 'B2',
      wordFamily: ['picturesquely (adv)'],
      collocations: ['picturesque village', 'picturesque landscape', 'picturesque view']
    },
    translations: {
      thai: {
        translation: 'งดงามราวกับภาพวาด / สวยงามมีเสน่ห์',
        phonetic: 'ngót-ngaam raaw kàp phâap-wâat',
        example: 'หมู่บ้านนี้สวยงามราวกับภาพวาดในช่วงฤดูหนาว',
        exampleTranslation: 'This village is picturesque in winter.'
      },
    }
  },

  // --- LESSON 5: SCIENCE, TECH & DIGITAL INNOVATION (B2 - C1) ---
  {
    word: 'algorithm',
    phonetic: '/ˈæl.ɡə.rɪ.ðəm/',
    phonetics: [{ text: '/ˈæl.ɡə.rɪ.ðəm/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A process or set of mathematical rules to be followed in calculations or problem-solving operations by a computer.',
            example: 'Search engines use complex algorithms to rank web pages relevantly.',
            synonyms: ['procedure', 'formula', 'system', 'code'],
            antonyms: ['randomness']
          }
        ]
      }
    ],
    synonyms: ['procedure', 'formula', 'method', 'routine'],
    antonyms: ['randomness'],
    lexicalInsights: {
      etymology: 'Derived from Persian mathematician Al-Khwarizmi (9th century).',
      memoryTip: 'Algorithm = step-by-step recipe for computer code.',
      cefrLevel: 'B2',
      wordFamily: ['algorithmic (adj)', 'algorithmically (adv)'],
      collocations: ['search algorithm', 'recommendation algorithm', 'AI algorithm']
    },
    translations: {
      thai: {
        translation: 'อัลกอริทึม / ขั้นตอนวิธีในการคำนวณ',
        phonetic: 'an-gɔɔ-rí-thʉ̂m',
        example: 'อัลกอริทึมนี้ช่วยประมวลผลข้อมูลได้รวดเร็วขึ้น',
        exampleTranslation: 'This algorithm processes data faster.'
      },
    }
  },
  {
    word: 'autonomous',
    phonetic: '/ɔːˈtɒn.ə.məs/',
    phonetics: [{ text: '/ɔːˈtɒn.ə.məs/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Having the freedom or power to govern itself or operate independently without direct human control.',
            example: 'Engineers tested autonomous vehicles navigating city streets safely.',
            synonyms: ['self-governing', 'independent', 'self-driving', 'sovereign'],
            antonyms: ['dependent', 'controlled', 'subordinate']
          }
        ]
      }
    ],
    synonyms: ['independent', 'self-governing', 'self-operating'],
    antonyms: ['dependent', 'controlled'],
    lexicalInsights: {
      etymology: 'From Greek autonomos: "auto-" (self) + "nomos" (law).',
      memoryTip: 'Auto (self) + nomous = making its own laws/decisions.',
      cefrLevel: 'C1',
      wordFamily: ['autonomy (n)', 'autonomously (adv)'],
      collocations: ['autonomous vehicle', 'autonomous robot', 'autonomous region']
    },
    translations: {
      thai: {
        translation: 'พึ่งพาตนเอง / ทำงานอัตโนมัติไร้คนขับ / เป็นอิสระ',
        phonetic: 'pʉ̂ng-phaa ddton-eng / tam-ngaan àt-dtà-nō-mát',
        example: 'รถยนต์ขับเคลื่อนอัตโนมัติกำลังทดสอบบนถนนจริง',
        exampleTranslation: 'Autonomous cars are testing on real roads.'
      },
    }
  }
];

export const REAL_CURATED_LESSONS: Lesson[] = [
  {
    id: 'lesson_1_essentials',
    title: 'Lesson 1: Essential Expressions & Character',
    subtitle: 'Core vocabulary for everyday interactions & personality traits',
    category: 'Foundations (A2 - B1)',
    level: 'B1',
    description: 'Master foundational adjectives and nouns essential for describing human character, mindset, and daily interactions.',
    iconName: 'Sparkles',
    words: [
      REAL_DICTIONARY_WORDS[0], // resilient
      REAL_DICTIONARY_WORDS[1], // empathy
      REAL_DICTIONARY_WORDS[2], // diligent
      REAL_DICTIONARY_WORDS[3], // authentic
      REAL_DICTIONARY_WORDS[4], // optimistic
    ]
  },
  {
    id: 'lesson_2_workplace',
    title: 'Lesson 2: Workplace & Professional Communication',
    subtitle: 'High-impact vocabulary for business, management & strategy',
    category: 'Business & Career (B2)',
    level: 'B2',
    description: 'Elevate your professional English in negotiations, team collaboration, project management, and strategic optimization.',
    iconName: 'Briefcase',
    words: [
      REAL_DICTIONARY_WORDS[5], // innovative
      REAL_DICTIONARY_WORDS[6], // collaborate
      REAL_DICTIONARY_WORDS[7], // negotiate
      REAL_DICTIONARY_WORDS[8], // streamline
      REAL_DICTIONARY_WORDS[9], // feasible
    ]
  },
  {
    id: 'lesson_3_toefl_ielts',
    title: 'Lesson 3: TOEFL & IELTS Band 8+ Masterclass',
    subtitle: 'Advanced analytical and academic vocabulary for top scores',
    category: 'Academic & Exams (C1 - C2)',
    level: 'C1',
    description: 'Crucial academic terms required for writing band 8+ essays, reading complex papers, and fluent formal interviews.',
    iconName: 'GraduationCap',
    words: [
      REAL_DICTIONARY_WORDS[10], // eloquent
      REAL_DICTIONARY_WORDS[11], // meticulous
      REAL_DICTIONARY_WORDS[12], // ubiquitous
      REAL_DICTIONARY_WORDS[13], // ephemeral
      REAL_DICTIONARY_WORDS[14], // serendipity
      REAL_DICTIONARY_WORDS[15], // quintessential
      REAL_DICTIONARY_WORDS[16], // scrutinize
      REAL_DICTIONARY_WORDS[17], // tenacious
    ]
  },
  {
    id: 'lesson_4_travel',
    title: 'Lesson 4: Travel, Culture & Global Hospitality',
    subtitle: 'Practical terms for journeys, scenery & international transit',
    category: 'Travel & Lifestyle (B1 - B2)',
    level: 'B1',
    description: 'Learn key travel vocabulary to smoothly plan itineraries, describe scenic destinations, and navigate international voyages.',
    iconName: 'Compass',
    words: [
      REAL_DICTIONARY_WORDS[18], // itinerary
      REAL_DICTIONARY_WORDS[19], // picturesque
      REAL_DICTIONARY_WORDS[3],  // authentic
      REAL_DICTIONARY_WORDS[0],  // resilient
    ]
  },
  {
    id: 'lesson_5_technology',
    title: 'Lesson 5: Science, AI & Digital Innovation',
    subtitle: 'Modern vocabulary for software, technology & research',
    category: 'Tech & Science (B2 - C1)',
    level: 'B2',
    description: 'Understand technology terminology, artificial intelligence algorithms, autonomous systems, and modern digital innovations.',
    iconName: 'Cpu',
    words: [
      REAL_DICTIONARY_WORDS[20], // algorithm
      REAL_DICTIONARY_WORDS[21], // autonomous
      REAL_DICTIONARY_WORDS[5],  // innovative
      REAL_DICTIONARY_WORDS[8],  // streamline
    ]
  }
];
