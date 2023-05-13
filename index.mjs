import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import boxen from "boxen";

const SCORE_FILE = "./highscore.json";
const GAME_DURATION = 120;

const scales = {
  major: [
    ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"],
    ["Sol", "La", "Si", "Do", "Ré", "Mi", "Fa♯"],
    ["Ré", "Mi", "Fa♯", "Sol", "La", "Si", "Do♯"],
    ["La", "Si", "Do♯", "Ré", "Mi", "Fa♯", "Sol♯"],
    ["Mi", "Fa♯", "Sol♯", "La", "Si", "Do♯", "Ré♯"],
    ["Si", "Do♯", "Ré♯", "Mi", "Fa♯", "Sol♯", "La♯"],
    ["Fa♯", "Sol♯", "La♯", "Si", "Do♯", "Ré♯", "Mi♯"],
    ["Sol♭", "La♭", "Si♭", "Do♭", "Ré♭", "Mi♭", "Fa"],
    ["Ré♭", "Mi♭", "Fa", "Sol♭", "La♭", "Si♭", "Do"],
    ["La♭", "Si♭", "Do", "Ré♭", "Mi♭", "Fa", "Sol"],
    ["Mi♭", "Fa", "Sol", "La♭", "Si♭", "Do", "Ré"],
    ["Si♭", "Do", "Ré", "Mi♭", "Fa", "Sol", "La"],
    ["Fa", "Sol", "La", "Si♭", "Do", "Ré", "Mi"],
  ],
  minor: [],
};

let currentScore = 0;
let currentStreak = 0;
let currentMultiplier = 1;
let nextMultiplier = 2;

const convertAnswer = (answer) => {
  const convertedAnswer = answer
    .replace("#", "♯")
    .replace("b", "♭")
    .replace("e", "é");
  return convertedAnswer.charAt(0).toUpperCase() + convertedAnswer.slice(1);
};

const degreeQuizz = async () => {
  const startTime = Date.now();
  let elapsedTime = 0;

  while (elapsedTime < GAME_DURATION) {
    const scaleIndex = Math.floor(Math.random() * scales.major.length);
    const degree = Math.floor(Math.random() * scales.major[scaleIndex].length);

    const degreeQuality = degree + 1 === 1 ? "er" : "ème";

    let answer;
    let correct = false;

    do {
      const response = await inquirer.prompt([
        {
          type: "input",
          name: "answer",
          message: `Quel est le ${chalk.green(
            degree + 1 + degreeQuality
          )} degré de la gamme de ${chalk.yellow(
            scales.major[scaleIndex][0] + " Majeur"
          )} ?`,
        },
      ]);

      answer = response.answer;
      elapsedTime = (Date.now() - startTime) / 1000;

      if (scales.major[scaleIndex][degree] === convertAnswer(answer)) {
        console.log(chalk.green("Bonne réponse !"));
        correct = true;
        currentStreak++;
        currentScore += 2 * currentMultiplier;
        if (currentStreak === nextMultiplier) {
          currentStreak = 0;
          currentMultiplier++;
          nextMultiplier++;
        }
      } else {
        console.log(chalk.red("Mauvaise réponse !"));
        currentMultiplier = Math.max(1, currentMultiplier - 1);
        currentStreak = 0;
      }

      console.log(
        `Score: ${currentScore}, Multiplier: x${currentMultiplier}\n`
      );
    } while (!correct && elapsedTime < GAME_DURATION);
  }

  displayLeaderboard();
};

const displayLeaderboard = () => {
  console.log("\n" + chalk.bgBlue("== LEADERBOARD =="));

  let leaderboardBox = `\nFinal score: ${chalk.green(currentScore)}\n`;

  let scores;
  if (fs.existsSync(SCORE_FILE)) {
    scores = JSON.parse(fs.readFileSync(SCORE_FILE));
  } else {
    scores = {};
  }

  if (
    !scores[`highscore_${GAME_DURATION}`] ||
    currentScore > scores[`highscore_${GAME_DURATION}`]
  ) {
    leaderboardBox += chalk.green("NEW HIGH SCORE! 🏆");
    scores[`highscore_${GAME_DURATION}`] = currentScore;
  } else {
    leaderboardBox += `Highscore: ${chalk.yellow(
      scores[`highscore_${GAME_DURATION}`]
    )}\n`;
  }

  fs.writeFileSync(SCORE_FILE, JSON.stringify(scores));

  console.log(
    boxen(leaderboardBox, {
      padding: 1,
      borderColor: "blue",
      borderStyle: "double",
    })
  );
};

const games = {
  "Degré Quizz 🌡": degreeQuizz,
};

inquirer
  .prompt([
    {
      type: "list",
      name: "game",
      message: "À quel jeu voulez-vous jouer ?",
      choices: Object.keys(games),
    },
  ])
  .then((answers) => {
    games[answers.game]();
  });
