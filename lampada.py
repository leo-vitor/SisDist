import socket
import messages_pb2  # Importe as mensagens geradas pelo Protocol Buffers

def lamp_main():
    # Endereço e porta do Gateway
    gateway_ip = '127.0.0.1'  # IP do Gateway
    gateway_port = 12347  # Porta do Gateway
    
    # Crie um socket TCP
    lamp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Conecte-se ao Gateway
        lamp_socket.connect((gateway_ip, gateway_port))
        print(f"Lâmpada conectada ao Gateway em {gateway_ip}:{gateway_port}")
        
        while True:
            # Simule o estado atual da lâmpada
            is_on = input("A lâmpada está ligada (S/N)? ").strip().lower() == "s"
            
            # Crie uma mensagem com o estado da lâmpada
            lamp_message = messages_pb2.SmartObjectMessage()
            lamp_message.object_id = 1  # Identificador da lâmpada
            lamp_message.message = "Ligada" if is_on else "Desligada"
            
            # Envie a mensagem para o Gateway
            lamp_socket.send(lamp_message.SerializeToString())
            
            # Aguarde uma resposta do Gateway
            response = lamp_socket.recv(1024)
            print(f"Resposta do Gateway: {response.decode('utf-8')}")
    
    except KeyboardInterrupt:
        print("Desconectando a lâmpada...")
    finally:
        lamp_socket.close()

if __name__ == "__main__":
    lamp_main()
