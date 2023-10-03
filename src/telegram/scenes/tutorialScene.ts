import { Composer } from "telegraf";
import { WizardScene } from "telegraf/scenes";
import { BotContext } from "../botContext";
import { clearInlineKeyboard, inlineKeyboard, reply, replyWithKeyboard } from "../../lib/telegram";
import { commands, messages, scenes } from "../../lib/constants";
import { addOtherCommandHandlers, dunnoHandler, kickHandler } from "../handlers";

function makeStepHandler(text: string, first: boolean, last: boolean) {
  const stepHandler = new Composer<BotContext>();

  const nextAction = "next";
  const exitAction = "exit";

  const keyboard = inlineKeyboard(
    ["Дальше", nextAction],
    ["Закончить", exitAction]
  );

  stepHandler.action(nextAction, async (ctx) => {
    await clearInlineKeyboard(ctx);

    if (last) {
      await reply(ctx, text);
      await ctx.scene.leave();
    } else {
      await replyWithKeyboard(ctx, keyboard, text);
      ctx.wizard.next();
    }
  });

  stepHandler.action(exitAction, async (ctx) => {
    await clearInlineKeyboard(ctx);
    await reply(ctx, messages.backToDialog)
    await ctx.scene.leave();
  });

  if (first) {
    stepHandler.use(async (ctx) => {
      await replyWithKeyboard(ctx, keyboard, text);
      ctx.wizard.next();
    });
  } else {
    addOtherCommandHandlers(stepHandler, commands.tutorial);

    stepHandler.use(kickHandler);
    stepHandler.use(dunnoHandler);
  }

  return stepHandler;
}

const steps = [
`<b>В чем суть ChatGPT?</b>

ChatGPT — это компьютерная нейронная сеть, способная понимать текст, поддерживать диалог и и помогать пользователям в различных заданиях по работе с информацией.

ChatGPT не просто копирует данные из интернета, а имитирует мышление. Алгоритм анализирует информацию и структурирует ответ, чтобы он был удобен для чтения и соответствовал вопросу.`,
`<b>Особенности ChatGPT</b>

📌 Не поисковая система.
Алгоритм обучался на базе данных до 2021 года и не предоставит вам актуальную информацию на самые последние события.

📌 Не всегда говорит правду.
Алгоритм может ошибаться, если ему была предоставлена неточная или недостаточная информация.

📌 Требует проверки результата.
Алгоритм может выдавать неправильный ответ из-за нечеткой формулировки вопроса или неправильного понимания контекста.

❗️ Поэтому важно научиться правильно формулировать задания для бота. 
И тогда он станет для вас полезным помощником в тех задачах, которые вы решаете.`,
`<b>Правила работы с ботом</b>

1. Задавайте боту роль.

Например:
«Я хочу, чтобы ты выступил в роли маркетолога».
«Отвечай, как персонаж (имя персонажа) из фильма (название фильма)».

2. Уточняйте.

Чем больше деталей — тем более актуальным и персонализированным будет ответ.

3. Ограничивайте.

Например:
«Предложи 3 варианта решения задачи».
«Используй для каждого варианта не более 10 слов».`,
`4. Задавайте структуру, в которой хотите видеть ответ.

Например:
«Сделай пошаговый алгоритм и разбей задачи на этапы с подзадачами».

5. Задавайте пример/стиль общения.

Например:
«Перепиши этот текст в таком стиле как следующее сообщение».
«Напиши ответ в стиле письма: формальный / неформальный / технический / разговорный / юмористический».

6. Не делайте отсылки ко внешним источникам (например, ссылка на сайт), так как ChatGPT воспринимает только текст, который ему дается.`,
`<b>Режимы работы бота</b>

В боте предусмотрены 3 режима работы с ChatGPT:

1. <b>Свободный диалог</b> — написание запросов и получение ответов. При этом ChatGPT запоминает историю последних 3-х сообщений. Режим подходит для формата «вопрос-ответ».

Например:
«Прочитай и перескажи в 3 предложениях суть следующего текста».
«Расскажи как научиться расставлять приоритеты».
«Придумай 10 вариантов названия для компании, занимающейся изготовлением детских игрушек из дерева».`,
`2. <b>Роль</b> — общение с ботом в роли Коуча, Психолога, Генератора идей. В рамках роли история сохраняется, и при возвращении к диалогу вы продолжаете с того места, на котором остановились.

3. <b>Свой промт</b> — инструкция, которую ChatGPT будет удерживать в памяти и учитывать при ответах все время, пока вы будете с ним общаться.

Например:
«Веди себя как учитель английского языка. Я буду писать предложения, а ты исправляй ошибки и говори что можно добавить. Отвечай на русском».`,
`<b>Тарифы</b>

В начале использования бота вам доступен тариф <b>«Бесплатный»</b> с ограничением до 10 запросов в сутки.

Если вам необходимо большее количество запросов — воспользуйтесь одним из премиальных тарифов (пункт меню «Оформить подписку» /${commands.premium})`,
`<b>Техподдержка</b>

Миссия GPToid — помочь вам в практическом освоении ChatGPT.

Бот и обучение поддержат вас в этом процессе.

Если у вас есть вопросы по решению ваших задач с помощью бота — напишите @gptoid_support.`,
`<b>Обучение завершено</b>

🔥 Вы молодец, что дочитали до конца! 🔥

Пробуйте взаимодействовать с ботом разными способами для решения тех задач, которые у вас есть.

Выбирайте один из режимов и начните писать боту свой первый запрос! 📝`
];

export const tutorialScene = new WizardScene<BotContext>(
  scenes.tutorial,
  ...steps.map((step, index) => makeStepHandler(step, index === 0, index === steps.length - 1)),
  async (ctx) => await ctx.scene.leave()
);