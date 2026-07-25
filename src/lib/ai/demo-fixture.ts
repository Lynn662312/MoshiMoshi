import type {
  ConversationReply,
  ExplanationLanguage,
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
    romaji:
      "Ekiin-san e\nKōtsū-kei IC kādo o tsukatte, kono eki no rokkā ni nimotsu o iremashita. Sono IC kādo o funshitsu shita tame, rokkā o akeraremasen. Rokkā no seikaku na bangō wa wakarimasen ga, basho o go-annai dekimasu. Nimotsu wa kon-iro no sūtsukēsu desu. Honnin kakunin ya shoyū kakunin ni hitsuyō na tetsuzuki o oshiete kudasai.",
    english:
      "For station staff: I stored luggage in a locker at this station using a transport IC card. I lost that card and cannot open the locker. I do not know the exact locker number, but I can show you the location. The luggage is a navy suitcase. Please tell me the official steps and what you need to verify my identity or ownership.",
  },
  fallbackAction:
    "If the ticket-gate staff cannot help directly, ask them to point out the locker operator or official support contact shown on the locker. Keep your route flexible because verification may take time.",
  safetyNote:
    "Moshi is not an emergency service and cannot unlock the locker or guarantee recovery. Use only official station or locker support channels, and do not share passport or payment details with unofficial helpers.",
};

export const lockerDemoPlanChinese: RescuePlan = {
  diagnosis: {
    title: "车站寄存柜绑定的交通 IC 卡丢失",
    summary:
      "行李很可能仍安全存放在寄存柜中，但用于识别和开启寄存柜的交通 IC 卡已经丢失。需要由车站工作人员或寄存柜服务人员确认具体柜位，并说明正规取回流程。",
    goal: "确认寄存柜位置，并请官方工作人员协助核实开启方式。",
    urgency: "medium",
    recommendedHelper: "最近检票口的车站工作人员或寄存柜官方服务点",
  },
  immediateSteps: [
    {
      order: 1,
      action: "先留在寄存柜区域附近，拍下整排柜子、周边标识和服务说明。",
      reason: "位置和运营方信息能帮助工作人员确认寄存柜，不必只依靠记忆。",
    },
    {
      order: 2,
      action: "前往最近的有人值守检票口，向工作人员出示下方说明卡。",
      reason: "车站工作人员可以确认寄存柜运营方，并引导你办理正规的取回手续。",
    },
    {
      order: 3,
      action: "准备描述行李外观，并出示任何能证明行李属于你的资料。",
      reason: "工作人员在安排开启寄存柜前，可能需要核实物品所有权。",
    },
  ],
  informationToPrepare: [
    {
      label: "寄存柜位置",
      whyNeeded: "工作人员需要知道车站、楼层、出口及寄存柜区域。",
      example: "西口附近，便利店旁边",
    },
    {
      label: "柜号或大致位置",
      whyNeeded: "这能帮助缩小具体柜位范围。",
      example: "从上往下第二排，315 号柜附近",
    },
    {
      label: "行李外观",
      whyNeeded: "可用于协助核实物品所有权。",
      example: "深蓝色硬壳行李箱，系有黄色绑带",
    },
    {
      label: "大致存放时间",
      whyNeeded: "有助于工作人员核对寄存记录。",
      example: "今天上午 10:30 左右",
    },
    {
      label: "交通 IC 卡信息",
      whyNeeded: "卡片类型、收据或手机记录可能有助于确认交易。",
      example: "实体 Suica 卡，无法提供卡号",
    },
  ],
  openingMessage: {
    japanese: lockerDemoPlan.openingMessage.japanese,
    romaji: lockerDemoPlan.openingMessage.romaji,
    english:
      "不好意思。我用交通 IC 卡把行李存进了这个车站的寄存柜，但卡丢失了，现在无法打开寄存柜。请问我应该怎么办？",
  },
  expectedQuestions: [
    {
      id: "which-locker",
      japanese: lockerDemoPlan.expectedQuestions[0].japanese,
      romaji: lockerDemoPlan.expectedQuestions[0].romaji,
      english: "是哪个寄存柜？",
      whyTheyAsk: "工作人员需要确认具体柜位和运营方。",
      suggestedAnswerJapanese:
        lockerDemoPlan.expectedQuestions[0].suggestedAnswerJapanese,
      suggestedAnswerRomaji:
        lockerDemoPlan.expectedQuestions[0].suggestedAnswerRomaji,
      suggestedAnswerEnglish: "我不知道准确柜号，但可以带您去寄存柜的位置。",
    },
    {
      id: "when-stored",
      japanese: lockerDemoPlan.expectedQuestions[1].japanese,
      romaji: lockerDemoPlan.expectedQuestions[1].romaji,
      english: "你是什么时候把行李放进去的？",
      whyTheyAsk: "大致时间可能有助于确认寄存记录。",
      suggestedAnswerJapanese:
        lockerDemoPlan.expectedQuestions[1].suggestedAnswerJapanese,
      suggestedAnswerRomaji:
        lockerDemoPlan.expectedQuestions[1].suggestedAnswerRomaji,
      suggestedAnswerEnglish: "是今天上午 10:30 左右。",
    },
    {
      id: "luggage-description",
      japanese: lockerDemoPlan.expectedQuestions[2].japanese,
      romaji: lockerDemoPlan.expectedQuestions[2].romaji,
      english: "行李是什么样的？",
      whyTheyAsk: "描述行李外观有助于核实物品所有权。",
      suggestedAnswerJapanese:
        lockerDemoPlan.expectedQuestions[2].suggestedAnswerJapanese,
      suggestedAnswerRomaji:
        lockerDemoPlan.expectedQuestions[2].suggestedAnswerRomaji,
      suggestedAnswerEnglish: "是一个深蓝色行李箱，我也可以说明其他特征。",
    },
  ],
  staffHandoffCard: {
    japanese: lockerDemoPlan.staffHandoffCard.japanese,
    romaji: lockerDemoPlan.staffHandoffCard.romaji,
    english:
      "给车站工作人员：我用交通 IC 卡将行李存进了这个车站的寄存柜。由于该卡丢失，现在无法打开寄存柜。我不知道准确柜号，但可以带您去具体位置。行李是一个深蓝色行李箱。请告知正规处理流程，以及核实身份或物品所有权需要提供什么。",
  },
  fallbackAction:
    "如果检票口工作人员无法直接处理，请他们指出寄存柜的运营方，或柜体上标注的官方联系方式。身份核实可能需要时间，请为后续行程预留余地。",
  safetyNote:
    "Moshi 不是紧急服务，无法开启寄存柜，也不能保证一定能取回行李。请只通过车站或寄存柜运营方的官方渠道处理，不要向非官方人员提供护照或付款信息。",
};

export function getLockerDemoPlan(language: ExplanationLanguage) {
  return language === "Simplified Chinese"
    ? lockerDemoPlanChinese
    : lockerDemoPlan;
}

export function demoConversationReply(
  staffMessage: string,
  language: ExplanationLanguage = "English",
): ConversationReply {
  const asksLocker = /どの|ロッカー|number|which/i.test(staffMessage);
  const useChinese = language === "Simplified Chinese";

  if (asksLocker) {
    return {
      staffMeaning: useChinese
        ? "工作人员可能在问你使用的是哪个寄存柜。"
        : "The staff member is probably asking which locker you used.",
      conversationStage: useChinese ? "确认寄存柜" : "Identifying the locker",
      recommendedAction: useChinese
        ? "带工作人员查看寄存柜区域或照片，并明确说明你不知道准确柜号。"
        : "Show them the locker area or your photo, and be clear that you do not know the exact number.",
      reply: {
        japanese:
          "正確な番号は分かりませんが、ロッカーの場所をご案内できます。写真もあります。",
        romaji:
          "Seikaku na bangō wa wakarimasen ga, rokkā no basho o go-annai dekimasu. Shashin mo arimasu.",
        english: useChinese
          ? "我不知道准确柜号，但可以带您去寄存柜的位置。我也有照片。"
          : "I do not know the exact number, but I can show you the locker location. I also have a photo.",
      },
      likelyNextStep: useChinese
        ? "工作人员可能会陪你前往寄存柜区域，或联系寄存柜运营方。"
        : "The staff member may walk with you to the locker bank or contact its operator.",
      needsHumanHelp: false,
    };
  }

  return {
    staffMeaning: useChinese
      ? "工作人员正在说明或询问下一步核实所需的信息。"
      : "The staff member is giving or requesting information about the next verification step.",
    conversationStage: useChinese ? "核实详细信息" : "Confirming details",
    recommendedAction: useChinese
      ? "请对方慢一点再说一次，并指出你需要填写的表格或前往的地点。"
      : "Ask them to repeat slowly and point to any form or place you need to go.",
    reply: {
      japanese:
        "すみません、日本語があまり分かりません。もう一度ゆっくりお願いできますか。次に何をすればよいですか。",
      romaji:
        "Sumimasen, Nihongo ga amari wakarimasen. Mō ichido yukkuri onegai dekimasu ka. Tsugi ni nani o sureba yoi desu ka.",
      english: useChinese
        ? "不好意思，我不太懂日语。可以请您再慢慢说一遍吗？我接下来应该做什么？"
        : "Sorry, I do not understand much Japanese. Could you say that again slowly? What should I do next?",
    },
    likelyNextStep: useChinese
      ? "对方可能会重新说明，指引你联系运营方，或询问用于核实身份和物品的信息。"
      : "They may restate the instruction, point you to the operator, or ask for identifying details.",
    needsHumanHelp: false,
  };
}
