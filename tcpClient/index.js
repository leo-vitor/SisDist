const net = require("net");
const readline = require("readline");
const chalk = require("chalk");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new net.Socket();

const connectionParams = {
  ip: "localhost", // IP do servidor (no caso, localhost)
  port: 3333, // Porta do servidor
  nickname: "",
};

function connectToServer() {
  client.connect(connectionParams.port, connectionParams.ip, () => {
    console.log(chalk.green("Cliente conectado ao servidor"));
    rl.question(
      chalk.yellow("Insira o nome de usuário desejado:\n"),
      (nickname) => {
        connectionParams.nickname = nickname;
        // Envie o comando /ENTRAR com o apelido
        client.write(`/ENTRAR ${connectionParams.nickname}`);
      }
    );
  });
}

client.on("data", (data) => {
  const messages = data.toString().trim().split("\n"); // Dividir mensagens por linha

  messages.forEach((message) => {
    try {
      const messageData = JSON.parse(message);

      if (messageData.owner && messageData.message) {
        console.log(
          chalk.magenta(messageData.owner) +
            ":\t" +
            chalk.white(messageData.message)
        );
      }

      if (messageData.error) {
        console.log(chalk.red(messageData.error));
      }

      if (messageData.serverMessage) {
        console.log(chalk.yellow(messageData.serverMessage));

        if (messageData.serverMessage === "Insira seu novo nome") {
          rl.question(
            chalk.yellow("Novo nome de usuário:\n"),
            (newNickname) => {
              client.write(
                JSON.stringify({
                  owner: connectionParams.nickname,
                  message: `/NICK ${newNickname}`,
                })
              );
            }
          );
        } else if (messageData.newName) {
          connectionParams.nickname = messageData.newName;
          console.log(
            chalk.yellow(`Seu novo nome é: ${connectionParams.nickname}`)
          );
        }
      }

      if (messageData.userList) {
        const userList = messageData.userList;
        console.log(chalk.yellow("Lista de usuários:"));
        userList.forEach((user) => {
          console.log(chalk.yellow(user));
        });
      }
    } catch (error) {
      console.error(chalk.red(`Erro ao processar mensagem: ${error.message}`));
    }
  });
});

client.on("close", () => {
  console.log(chalk.red("Cliente desconectado"));
});

client.on("error", (err) => {
  console.log(chalk.red(err));
});

rl.on("line", (input) => {
  if (input.startsWith("/ENTRAR")) {
    connectToServer();
  } else if (input.startsWith("/NICK ")) {
    const newNickname = input.substring(6).trim();
    client.write(
      JSON.stringify({
        owner: connectionParams.nickname,
        message: `/NICK ${newNickname}`,
      })
    );
  } else {
    client.write(
      JSON.stringify({
        owner: connectionParams.nickname,
        message: input,
      })
    );
  }
});

// Inicie a conexão com o servidor quando o código é executado
// connectToServer();
