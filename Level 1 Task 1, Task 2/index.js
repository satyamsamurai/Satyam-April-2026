 function colorChangeFunction() {
            const button = document.getElementById('colorButton');
            const currentColor = button.style.backgroundColor;
            if (currentColor === 'blue') {
                button.style.backgroundColor = 'green';
            } else {
                button.style.backgroundColor = 'blue';
            }
           
        }



        function showGreeting() {

    let now = new Date();
    let hour = now.getHours();

    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
    }
    else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon";
    }
    else if (hour >= 17 && hour < 21) {
        greeting = "Good Evening";
    }
    else {
        greeting = "Good Night";
    }

    alert(greeting +" Cognifyz Technologies! Hope you are having a great day!");
}



function addNumbers() {

    let number1 = document.getElementById("num1").value;
    let number2 = document.getElementById("num2").value;

    number1 = Number(number1);
    number2 = Number(number2);

    let sum = number1 + number2;

    document.getElementById("result").innerText = "Result: " + sum;
}