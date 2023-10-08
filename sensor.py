import socket
import messages_pb2  # Importe as mensagens geradas pelo Protocol Buffers
import random
import time

def sensor_main():
    # Endereço e porta do Gateway
    gateway_ip = '127.0.0.1'  # IP do Gateway
    gateway_port = 12347  # Porta do Gateway
    
    # ID do sensor
    sensor_id = 2  # Suponha o ID
    
    # Crie um socket TCP
    sensor_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Conecte-se ao Gateway
        sensor_socket.connect((gateway_ip, gateway_port))
        print(f"Sensor {sensor_id} conectado ao Gateway em {gateway_ip}:{gateway_port}")
        
        while True:
            # Simule a medição de temperatura e umidade
            temperatura = random.uniform(20, 30)
            umidade = random.uniform(40, 60)
            
            # Crie uma mensagem com os valores de temperatura e umidade
            sensor_message = messages_pb2.SmartObjectMessage()
            sensor_message.object_id = sensor_id
            sensor_message.message = f"Temperatura: {temperatura}°C, Umidade: {umidade}%"
            
            # Envie a mensagem para o Gateway
            sensor_socket.send(sensor_message.SerializeToString())
            
            # Aguarde um intervalo de tempo antes de enviar a próxima medição
            time.sleep(1)  # Envie a cada 10 segundos 
    
    except KeyboardInterrupt:
        print(f"Desconectando o Sensor {sensor_id}...")
    finally:
        sensor_socket.close()

if __name__ == "__main__":
    sensor_main()
