import random

# 1. Creamos las dos listas con nombres
lista1 = ["Ana", "Carlos", "María", "Sofia"]
lista2 = ["Diego", "Luis", "Elena", "Gabriel"]

# 2. Mostramos los nombres en pantalla
print("Nombres en Lista 1:", lista1)
print("Nombres en Lista 2:", lista2)

# 3. El alumno escribe su nombre
mi_nombre = input("\nEscribe tu nombre: ")

# 4. Usamos random.choice() para elegir un amigo al azar de la otra lista
amigo_aleatorio = random.choice(lista2)

# 5. Mostramos el resultado de compatibilidad
print("\n----------------------------------------")
print("¡Hola", mi_nombre + "!")
print("Tu amigo compatible seleccionado por el azar es:", amigo_aleatorio)
print("¡Tienen un 100% de compatibilidad para trabajar juntos!")
print("----------------------------------------")
