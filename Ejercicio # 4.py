import random

# 1. Completa la listas de amigos
lista1 
lista2 

# 2. Mostramos los nombres en pantalla con el comando print


# 3. El alumno escribe un nombre de la lista1
mi_nombre = input("\nEscribe tu nombre: ")

# 4. Usamos random.choice() para elegir un amigo al azar de la otra lista
amigo_aleatorio = random.choice(lista2)

# 5. Mostramos el resultado de compatibilidad
print("\n----------------------------------------")
print("¡Hola", mi_nombre + "!")
print("Tu amigo compatible seleccionado por el azar es:", amigo_aleatorio)
print("¡Tienen un 100% de compatibilidad para trabajar juntos!")
print("----------------------------------------")
