import socket
import messages_pb2  # Importe as mensagens geradas pelo Protocol Buffers

def sound_device_main():
    # Endereço e porta do Gateway
    gateway_ip = '127.0.0.1'  # IP do Gateway
    gateway_port = 12347  # Porta do Gateway
    
    # ID do dispositivo de som
    sound_device_id = 3  # Suponha que o ID do dispositivo de som seja 3
    
    # Crie um socket TCP
    sound_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Conecte-se ao Gateway
        sound_socket.connect((gateway_ip, gateway_port))
        print(f"Dispositivo de Som {sound_device_id} conectado ao Gateway em {gateway_ip}:{gateway_port}")
        
        while True:
            # Aguarde o comando do Gateway para fornecer informações
            command = input("Digite 'info' para obter informações (volume/música): ").strip().lower()
            
            if command == "info":
                # Crie uma mensagem com informações (volume e música)
                sound_message = messages_pb2.SmartObjectMessage()
                sound_message.object_id = sound_device_id
                sound_message.message = "Volume: 75%, Música: 'Noite Estrelada'"
                
                # Envie a mensagem para o Gateway
                sound_socket.send(sound_message.SerializeToString())
    
    except KeyboardInterrupt:
        print(f"Desconectando o Dispositivo de Som {sound_device_id}...")
    finally:
        sound_socket.close()

if __name__ == "__main__":
    sound_device_main()
