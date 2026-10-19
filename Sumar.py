# 1. Definimos la función para sumar
def sumar(a, b):
  return a + b


# 2. Función principal para interactuar con el usuario
def calculadora_suma():
  print("--- CALCULADORA DE SUMAS ---")
  
  try:
    # Solicitamos los dos números al usuario
    num1 = float(input("Introduce el primer número: "))
    num2 = float(input("Introduce el segundo número: "))
    
    # Llamamos a la función y mostramos el resultado
    resultado = sumar(num1, num2)
    print(f"Resultado: {num1} + {num2} = {resultado}")
    
  except ValueError:
    print("Error: Por favor, introduce únicamente valores numéricos.")


# 3. Ejecutamos la calculadora
calculadora_suma()
