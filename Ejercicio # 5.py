import math

print("=== GRAFICADOR DE PUNTOS EN CONSOLA ===")
print("Ingresa coordenadas entre -5 y 5 para verlas en el plano.\n")

# 1. Entrada de datos (Defina 4 variables x1, y1, x2, y2) utilice 
# el comando input, son numeros enteros, especifique que seden ser entre
# el valor -5 y 5
##DEFINIR VARIABLES##

##FIN DE VARIABLES##

# 2. Cálculo matemático
distancia = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

# 3. Dibujo del plano cartesiano ASCII (Lienzo de 11x11, de y=5 a y=-5 y de x=-5 a x=5)
print(f"\nDistancia calculada: {distancia:.2f} unidades\n")
print("PLANO CARTESIANO:")

for y in range(5, -6, -1):
    fila = ""
    for x in range(-5, 6):
        # Verificar si la celda coincide con los puntos
        if x == x1 and y == y1:
            fila += " A "  # Punto 1
        elif x == x2 and y == y2:
            fila += " B "  # Punto 2
        # Dibujar ejes cartesianos
        elif x == 0 and y == 0:
            fila += " + "  # Origen
        elif x == 0:
            fila += " | "  # Eje Y
        elif y == 0:
            fila += "---"  # Eje X
        else:
            fila += " . "  # Fondo de cuadrícula
            
    print(f"{y:2d} {fila}") # Imprime el número del eje Y y la fila correspondiente

# Imprimir eje X en la base
print("    " + " ".join([f"{x:2d}" for x in range(-5, 6)]))
