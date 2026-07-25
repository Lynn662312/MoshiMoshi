import type {
  ConversationReply,
  RescueInput,
  RescuePlan,
} from "@/lib/schemas/rescue";

export const LOCKER_DEMO_SITUATION =
  "I stored my luggage in a station locker using my IC card, but I lost the card and now I cannot open the locker.";

export const LOCKER_DEMO_LOCATION =
  "Inside a large Tokyo train station, near the coin lockers";

export const LOCKER_DEMO_KNOWN =
  "The locker is in this station. I remember the locker area but not the exact number. The luggage is a navy suitcase.";

export function isLockerDemo(input: RescueInput) {
  const normalized = input.situation.toLowerCase();
  return (
    input.category === "locker" &&
    normalized.includes("locker") &&
    normalized.includes("ic card") &&
    normalized.includes("lost")
  );
}

export const lockerDemoPlan: RescuePlan = {
  diagnosis: {
    title: "Lost IC card linked to a station locker",
    summary:
      "Your luggage is likely still secured, but the card used to identify and open the locker is missing. Station or locker support staff will need to verify which locker is yours and explain the official recovery process.",
    goal: "Identify the locker and ask official staff to help verify access.",
    urgency: "medium",
    recommendedHelper:
      "Station staff at the nearest ticket gate or the locker support contact point",
  },
  immediateSteps: [
    {
      order: 1,
      action:
        "Stay near the locker area and photograph the locker bank, nearby signs, and any support label.",
      reason:
        "The location and operator details help staff identify the correct lockers without relying on memory.",
    },
    {
      order: 2,
      action:
        "Go to the nearest staffed ticket gate and show the staff handoff card below.",
      reason:
        "Station staff can identify who operates the locker and direct you to the official recovery process.",
    },
    {
      order: 3,
      action:
        "Be ready to describe the suitcase and show any proof connecting you to it.",
      reason:
        "Staff may need to verify ownership before arranging access.",
    },
  ],
  informationToPrepare: [
    {
      label: "Locker location",
      whyNeeded: "Staff need the station, floor, exit, and locker bank.",
      example: "Near the west exit, beside the convenience store",
    },
    {
      label: "Locker number or position",
      whyNeeded: "It narrows down the exact compartment.",
      example: "Second row from the top, near locker 315",
    },
    {
      label: "Luggage description",
      whyNeeded: "It may help staff verify ownership.",
      example: "Navy hard-shell suitcase with a yellow strap",
    },
    {
      label: "Approximate storage time",
      whyNeeded: "It helps staff match the locker transaction.",
      example: "Today at about 10:30 a.m.",
    },
    {
      label: "IC card details",
      whyNeeded:
        "The card type and any receipt or mobile record may help identify the transaction.",
      example: "A physical Suica card; no card number available",
    },
  ],
  openingMessage: {
    japanese:
      "すみません。交通系ICカードを使ってこの駅のロッカーに荷物を入れましたが、そのカードをなくして、ロッカーを開けられません。どうすればよいか教えていただけますか。",
    romaji:
      "Sumimasen. Kōtsū-kei IC kādo o tsukatte kono eki no rokkā ni nimotsu o iremashita ga, sono kādo o nakushite, rokkā o akeraremasen. Dō sureba yoi ka oshiete itadakemasu ka.",
    english:
      "Excuse me. I put my luggage in a locker at this station using a transport IC card, but I lost the card and cannot open the locker. Could you please tell me what I should do?",
  },
  expectedQuestions: [
    {
      id: "which-locker",
      japanese: "どのロッカーですか。",
      romaji: "Dono rokkā desu ka?",
      english: "Which locker is it?",
      whyTheyAsk: "They need to locate the exact locker and operator.",
      suggestedAnswerJapanese:
        "正確な番号は分かりませんが、場所はご案内できます。",
      suggestedAnswerRomaji:
        "Seikaku na bangō wa wakarimasen ga, basho wa go-annai dekimasu.",
      suggestedAnswerEnglish:
        "I do not know the exact number, but I can show you the location.",
    },
    {
      id: "when-stored",
      japanese: "いつ荷物を入れましたか。",
      romaji: "Itsu nimotsu o iremashita ka?",
      english: "When did you put the luggage in?",
      whyTheyAsk: "The approximate time may help identify the transaction.",
      suggestedAnswerJapanese:
        "今日の午前10時半ごろです。",
      suggestedAnswerRomaji: "Kyō no gozen jū-ji han goro desu.",
      suggestedAnswerEnglish: "It was today at around 10:30 a.m.",
    },
    {
      id: "luggage-description",
      japanese: "荷物はどのようなものですか。",
      romaji: "Nimotsu wa dono yō na mono desu ka?",
      english: "What does the luggage look like?",
      whyTheyAsk: "A description can support an ownership check.",
      suggestedAnswerJapanese:
        "紺色のスーツケースです。ほかの特徴も説明できます。",
      suggestedAnswerRomaji:
        "Kon-iro no sūtsukēsu desu. Hoka no tokuchō mo setsumei dekimasu.",
      suggestedAnswerEnglish:
        "It is a navy suitcase. I can describe other details too.",
    },
  ],
  staffHandoffCard: {
    japanese:
      "駅員さんへ\n交通系ICカードを使って、この駅のロッカーに荷物を入れました。そのICカードを紛失したため、ロッカーを開けられません。ロッカーの正確な番号は分かりませんが、場所をご案内できます。荷物は紺色のスーツケースです。本人確認や所有確認に必要な手続きを教えてください。",
    english:
      "For station staff: I stored luggage in a locker at this station using a transport IC card. I lost that card and cannot open the locker. I do not know the exact locker number, but I can show you the location. The luggage is a navy suitcase. Please tell me the official steps and what you need to verify my identity or ownership.",
  },
  fallbackAction:
    "If the ticket-gate staff cannot help directly, ask them to point out the locker operator or official support contact shown on the locker. Keep your route flexible because verification may take time.",
  safetyNote:
    "Moshi is not an emergency service and cannot unlock the locker or guarantee recovery. Use only official station or locker support channels, and do not share passport or payment details with unofficial helpers.",
};

export function demoConversationReply(staffMessage: string): ConversationReply {
  const asksLocker = /どの|ロッカー|number|which/i.test(staffMessage);

  if (asksLocker) {
    return {
      staffMeaning:
        "The staff member is probably asking which locker you used.",
      conversationStage: "Identifying the locker",
      recommendedAction:
        "Show them the locker area or your photo, and be clear that you do not know the exact number.",
      reply: {
        japanese:
          "正確な番号は分かりませんが、ロッカーの場所をご案内できます。写真もあります。",
        romaji:
          "Seikaku na bangō wa wakarimasen ga, rokkā no basho o go-annai dekimasu. Shashin mo arimasu.",
        english:
          "I do not know the exact number, but I can show you the locker location. I also have a photo.",
      },
      likelyNextStep:
        "The staff member may walk with you to the locker bank or contact its operator.",
      needsHumanHelp: false,
    };
  }

  return {
    staffMeaning:
      "The staff member is giving or requesting information about the next verification step.",
    conversationStage: "Confirming details",
    recommendedAction:
      "Ask them to repeat slowly and point to any form or place you need to go.",
    reply: {
      japanese:
        "すみません、日本語があまり分かりません。もう一度ゆっくりお願いできますか。次に何をすればよいですか。",
      romaji:
        "Sumimasen, Nihongo ga amari wakarimasen. Mō ichido yukkuri onegai dekimasu ka. Tsugi ni nani o sureba yoi desu ka.",
      english:
        "Sorry, I do not understand much Japanese. Could you say that again slowly? What should I do next?",
    },
    likelyNextStep:
      "They may restate the instruction, point you to the operator, or ask for identifying details.",
    needsHumanHelp: false,
  };
}
