def suma(num1,num2):
    print("Suma=",num1+num2)

def resta(num1,num2):
    print("Resta=",num1-num2)

def multiplicacion(num1,num2):
    print("Multiplicacion=",num1*num2)

def division(num1,num2):
    print("Division=",num1/num2)

while True:
    print("1. Suma")
    print("2. Resta")
    print("3. Multiplicacion")
    print("4. Division")    
    print("5. Salir")
    choice=int(input("Seleccione su opcion (1-5):"))

    if choice==1:
        num1=int(input("Ingrese el primer numero: "))
        num2=int(input("Ingrese el segundo numero :"))
        suma(num1,num2)


    elif choice==2:
        num1=int(input("Ingrese el primer numero: "))
        num2=int(input("Ingrese el segundo numero :"))
        resta(num1,num2)
    
    elif choice==3:
        num1=int(input("Ingrese el primer numero: "))
        num2=int(input("Ingrese el segundo numero :"))
        multiplicacion(num1,num2)
    
    elif choice==4:
        num1=int(input("Ingrese el primer numero: "))
        num2=int(input("Ingrese el segundo numero :"))
        if num2 == 0:
            print('Infinity')
        else:
            division(num1,num2)
                
    elif choice==5:
        break
    else:
        print("Wrong Choice")
