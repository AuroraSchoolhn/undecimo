"""
Tres en Raya (Tic-Tac-Toe) - Juego de consola para dos jugadores
Ejecutar con: python tres_en_raya.py
"""

tablero = [str(i) for i in range(1, 10)]  # Tablero inicial numerado del 1 al 9


def mostrar_tablero():
    print()
    print(f" {tablero[0]} | {tablero[1]} | {tablero[2]} ")
    print("---+---+---")
    print(f" {tablero[3]} | {tablero[4]} | {tablero[5]} ")
    print("---+---+---")
    print(f" {tablero[6]} | {tablero[7]} | {tablero[8]} ")
    print()


def hay_ganador():
    combinaciones = [
        (0, 1, 2), (3, 4, 5), (6, 7, 8),  # filas
        (0, 3, 6), (1, 4, 7), (2, 5, 8),  # columnas
        (0, 4, 8), (2, 4, 6),             # diagonales
    ]
    for a, b, c in combinaciones:
        if tablero[a] == tablero[b] == tablero[c]:
            return tablero[a]
    return None


def tablero_lleno():
    return all(casilla in ("X", "O") for casilla in tablero)


def pedir_jugada(jugador):
    while True:
        entrada = input(f"Jugador {jugador}, elige una casilla (1-9): ").strip()
        if not entrada.isdigit() or not (1 <= int(entrada) <= 9):
            print("⚠️  Ingresa un número válido entre 1 y 9.")
            continue
        pos = int(entrada) - 1
        if tablero[pos] in ("X", "O"):
            print("⚠️  Esa casilla ya está ocupada. Elige otra.")
            continue
        return pos


def jugar():
    print("=" * 30)
    print("   TRES EN RAYA (X vs O)")
    print("=" * 30)
    print("Las casillas están numeradas del 1 al 9 así:")
    mostrar_tablero()

    jugador_actual = "X"

    while True:
        pos = pedir_jugada(jugador_actual)
        tablero[pos] = jugador_actual
        mostrar_tablero()

        ganador = hay_ganador()
        if ganador:
            print(f"🎉 ¡El jugador {ganador} ha ganado! 🎉")
            break

        if tablero_lleno():
            print("🤝 ¡Empate! El tablero se ha llenado.")
            break

        jugador_actual = "O" if jugador_actual == "X" else "X"

    jugar_de_nuevo = input("\n¿Quieres jugar otra vez? (s/n): ").strip().lower()
    if jugar_de_nuevo == "s":
        for i in range(9):
            tablero[i] = str(i + 1)
        jugar()
    else:
        print("¡Gracias por jugar! 👋")


if __name__ == "__main__":
    jugar()
