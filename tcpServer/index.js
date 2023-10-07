import net from "net";
import chalk from "chalk";

const USER_LIMIT = 4;

const clients = new Map(); // Armazena informações dos clientes conectados
const nicknames = new Map(); // Armazena apelidos dos clientes

const server = net.createServer((socket) => {
  let currentClient = null; // Armazena informações do cliente atual

  function broadcast(message, excludeCurrent = false) {
    clients.forEach((clientSocket, clientName) => {
      if (clientSocket !== socket || !excludeCurrent) {
        clientSocket.write(JSON.stringify(message)); // Envie mensagens como JSON
      }
    });
  }

  socket.setEncoding("utf-8");

  socket.on("data", (data) => {
    const message = data.toString().trim();

    if (!currentClient) {
      // Se o cliente não estiver registrado, tratamos como um comando de entrada
      const parts = message.split(" ");
      const command = parts[0];

      switch (command) {
        case "/ENTRAR":
          if (clients.size >= USER_LIMIT) {
            socket.write(
              JSON.stringify({ error: "Limite de usuários atingido!" })
            );
            socket.end();
          } else {
            const nickname = parts[1];
            if (!clients.has(nickname)) {
              currentClient = nickname;
              clients.set(nickname, socket);
              nicknames.set(socket, nickname); // Salvar o apelido associado ao socket
              socket.write(
                JSON.stringify({ serverMessage: "Bem-vindo ao chat!" })
              );
              broadcast({
                serverMessage: `Usuário ${currentClient} entrou na sala.`,
              });
              console.log(`Usuário ${currentClient} entrou na sala.`);
            } else {
              socket.write(JSON.stringify({ error: "Apelido já em uso!" }));
              socket.end();
            }
          }
          break;
        default:
          socket.write(
            JSON.stringify({
              error: "Você deve se conectar primeiro usando /ENTRAR <apelido>.",
            })
          );
          socket.end();
      }
    } else {
      const messageObject = JSON.parse(message);

      // Cliente registrado, tratamos como uma mensagem
      if (messageObject.message === "/USUARIOS") {
        const userList = Array.from(nicknames.values());
        socket.write(JSON.stringify({ userList }));
      } else if (messageObject.message.startsWith("/NICK ")) {
        const newNickname = messageObject.message.substring(6).trim();
        if (!clients.has(newNickname)) {
          const oldNickname = currentClient;
          currentClient = newNickname;
          clients.delete(oldNickname);
          clients.set(newNickname, socket);
          nicknames.set(socket, newNickname); // Salvar o apelido associado ao socket
          socket.write(
            JSON.stringify({ serverMessage: "Apelido alterado com sucesso!" })
          );
          broadcast({
            serverMessage: `Usuário ${oldNickname} mudou seu apelido para ${newNickname}.`,
            newName: newNickname, // Envie o novo apelido para todos os clientes
          });
          console.log(
            `Usuário ${oldNickname} mudou seu apelido para ${newNickname}.`
          );
        } else {
          socket.write(JSON.stringify({ error: "Apelido já em uso!" }));
        }
      } else if (messageObject.message === "/SAIR") {
        socket.end();
      } else {
        // Mensagem regular, broadcast para todos os clientes
        broadcast(messageObject, true);
        console.log(`[${nicknames.get(socket)}]: ${messageObject.message}`);
      }
    }
  });

  socket.on("close", () => {
    if (currentClient) {
      const nickname = nicknames.get(socket);
      clients.delete(nickname);
      nicknames.delete(socket);
      broadcast({
        serverMessage: `Usuário ${nickname} saiu da sala.`,
      });
      console.log(`Usuário ${nickname} saiu da sala.`);
    }
  });

  socket.on("error", (error) => {
    console.error(
      `Erro de conexão com cliente ${currentClient}: ${error.message}`
    );
  });
});

server.on("listening", () => {
  const address = server.address();
  console.log(
    chalk.green(`Servidor TCP ouvindo em ${address.address}:${address.port}.`)
  );
});

server.on("error", (error) => {
  console.error(`Erro no servidor: ${error.message}`);
});

server.listen(3333);
