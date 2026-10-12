# EJERCICIO # 5
# INGRESE 6 EQUIPOS DE FUTBALL EN LA LISTA, LA VARIABLE SE LLAMA equipos
# DIGITE EL COMANDO PRINT EN LA FRASE QUE LO NECESITA
# UN IF LE HACE FALTA UN SIGNO PARA QUE FUNCIONE BIEN


#CODIGO DEL EJERCICIO
import random
import time


def limpiar_pantalla():
    print("\n" + "=" * 50 + "\n")


def simular_torneo():
    print("⚽ ¡BIENVENIDO A LA COPA DE FÚTBOL! ⚽")
    print(
        "Dirige a tu equipo favorito y demuestra tus tácticas para ganar el"
        " partido.\n"
    )

    # Lista de equipos participantes (Ingrese 6)
    equipos = [  ]

    print("Equipos disponibles en el torneo:")
    for i, eq in enumerate(equipos, 1):
        print(f"{i}. {eq}")

    # 1. Uso de input y validación con random.choice como respaldo
    try:
        eleccion = int(input("\nElige el número de tu equipo (1 al 6): ")) - 1
        if 0 <= eleccion < len(equipos):
            mi_equipo = equipos[eleccion]
        else:
            # random.choice elige un elemento aleatorio de una lista
            mi_equipo = random.choice(equipos)
            print(
                f"⚠️ Opción fuera de rango. El sistema te asignó al azar:"
                f" {mi_equipo}"
            )
    except ValueError:
        mi_equipo = random.choice(equipos)
        print(
            f"⚠️ Entrada no válida. El sistema te asignó al azar: {mi_equipo}"
        )

    print(f"\n🌟 ¡Excelente! Tu equipo oficial es: **{mi_equipo}**")
    time.sleep(1.5)

    # 2. Elegir un rival aleatorio diferente al nuestro usando random.choice
    rivales_disponibles = [eq for eq in equipos if eq != mi_equipo]
    rival = random.choice(rivales_disponibles)

    limpiar_pantalla()
    (f"🔥 ¡GRAN PARTIDO DE HOY! 🔥")
    print(f"🏟️ {mi_equipo}  VS  {rival}")
    print("El árbitro silba el inicio del encuentro...\n")
    time.sleep(2)

    # 3. Uso de random.randint para generar goles realistas (entre 0 y 4 goles)
    goles_mio = random.randint(0, 4)
    goles_rival = random.randint(0, 4)

    # Listas de eventos para narrar el partido usando random.choice
    jugadas_ataque = [
        "¡Disparo potente desde fuera del área que sacude las redes!",
        "¡Jugada de pizarrón en un tiro de esquina y golazo!",
        "¡Gran desborde por la banda y definición perfecta frente al arco!",
    ]

    jugadas_defensa = [
        "¡El portero se estira y realiza una atajada milagrosa!",
        "¡El balón se estrella violentamente en el travesaño!",
        "¡Gran interrupción del defensa central evitando el peligro!",
    ]

    # Narración dinámica basada en los goles
    print("📢 [MINUTO 45] - Medio tiempo:")
    if goles_mio > 0:
        print(f"✨ ¡Ataque de tu equipo! {random.choice(jugadas_ataque)}")
    else:
        print(f"🛡️ ¡Momento tenso! {random.choice(jugadas_defensa)}")

    time.sleep(3)
    print("\n📢 [MINUTO 90] - ¡Pitido final del partido!\n")
    time.sleep(1)

    # Resultado final
    limpiar_pantalla()
    print("🏆 ¡RESULTADO OFICIAL DEL ENCUENTRO! 🏆")
    print(f"     {mi_equipo} : {goles_mio}")
    print(f"     {rival}       : {goles_rival}")
    print("-" * 40)

    # Calificación final del desempeño
    if goles_mio > goles_rival
        print(
            f"🥇 ¡VICTORIA HISTÓRICA! {mi_equipo} se lleva los 3 puntos y el"
            " aplauso de la tribuna."
        )
    elif goles_mio == goles_rival:
        print(
            "🤝 ¡EMPATE AGÓNICO! Ambos equipos pelearon con todo, reparto de"
            " puntos justo."
        )
    else:
        print(
            f"💔 Derrota dura. {rival} aprovechó sus oportunidades. ¡A ajustar la"
            " táctica para la próxima!"
        )


# Ejecutar el simulador
simular_torneo()
