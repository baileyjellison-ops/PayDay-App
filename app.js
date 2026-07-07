 /*
==================================================
PayDay Control System 1.9.0

app.js

Part 1/4

Core Engine
Storage
Data Models
Date Engine
==================================================
*/

"use strict";


/*
==================================================
APPLICATION STATE
==================================================
*/


const PayDay = {

    settings: {

        paycheckAmount:2184,

        payFrequency:"Bi-Weekly",

        nextPayDate:new Date(),

        protectedSavings:100,

        protectedCash:150,

        allocation:{

            savings:50,

            debt:30,

            other:20

        }

    },


    bills:[],


    selectedPaycheck:0,


    selectedMonth:new Date(),


    editingBill:null

};



/*
==================================================
STORAGE
==================================================
*/


const STORAGE = {

    settings:"payday_settings",

    bills:"payday_bills"

};



function saveData(){

    localStorage.setItem(
        STORAGE.settings,
        JSON.stringify(PayDay.settings)
    );


    localStorage.setItem(
        STORAGE.bills,
        JSON.stringify(PayDay.bills)
    );

}




function loadData(){

    const settings =
        localStorage.getItem(STORAGE.settings);


    const bills =
        localStorage.getItem(STORAGE.bills);



    if(settings){

        PayDay.settings = {

            ...PayDay.settings,

            ...JSON.parse(settings)

        };

    }



    if(bills){

        PayDay.bills =
            JSON.parse(bills)
            .map(bill=>createBill(bill));

    }

}





/*
==================================================
HELPERS
==================================================
*/


function money(value){

    return Number(value || 0)
    .toLocaleString(
        "en-US",
        {
            style:"currency",
            currency:"USD"
        }
    );

}




function createID(){

    return Date.now() +
        Math.floor(Math.random()*1000);

}




function ordinal(day){

    if(day>3 && day<21)

        return day+"th";


    switch(day%10){

        case 1:
            return day+"st";

        case 2:
            return day+"nd";

        case 3:
            return day+"rd";

        default:
            return day+"th";

    }

}




/*
==================================================
DATE ENGINE
==================================================
*/


function cloneDate(date){

    return new Date(date.getTime());

}




function addDays(date,days){

    let result = cloneDate(date);

    result.setDate(
        result.getDate()+days
    );

    return result;

}





function addMonths(date,months){

    let result = cloneDate(date);

    result.setMonth(
        result.getMonth()+months
    );

    return result;

}





function getPayInterval(){

    switch(PayDay.settings.payFrequency){

        case "Weekly":

            return 7;


        case "Monthly":

            return 30;


        default:

            return 14;

    }

}





function getPayPeriodEnd(start){

    return addDays(
        start,
        getPayInterval()-1
    );

}




function isDateInRange(date,start,end){

    return (
        date >= start &&
        date <= end
    );

}





function getMonthStart(date){

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );

}





function getBillDate(bill,month){

    return new Date(
        month.getFullYear(),
        month.getMonth(),
        bill.dueDay
    );

}




/*
==================================================
BILL MODEL
==================================================
*/


function createBill(data){

    return {

        id:
            data.id ||
            createID(),


        name:
            data.name ||
            "New Bill",


        amount:
            Number(data.amount)||0,


        dueDay:
            Number(data.dueDay)||1,


        priority:
            Number(data.priority)||1,


        category:
            data.category ||
            "Other",


        recurrence:
            data.recurrence ||
            "Monthly",


        status:
            data.status ||
            "Upcoming",


        paymentAllocation:
            data.paymentAllocation ||
            "Full Amount"


    };

}





/*
==================================================
BILL CRUD
==================================================
*/


function addBill(data){

    PayDay.bills.push(
        createBill(data)
    );


    saveData();

}




function updateBill(id,data){

    let bill =
        PayDay.bills.find(
            b=>b.id===id
        );


    if(!bill)

        return;


    Object.assign(
        bill,
        data
    );


    saveData();

}





function deleteBill(id){

    PayDay.bills =
        PayDay.bills.filter(
            b=>b.id!==id
        );


    saveData();

}





function billsByPriority(priority){

    return PayDay.bills.filter(
        bill=>bill.priority===priority
    );

}




function totalBills(){

    return PayDay.bills.reduce(
        (sum,bill)=>
            sum+bill.amount,
        0
    );

}




function priorityTotal(priority){

    return billsByPriority(priority)
    .reduce(
        (sum,bill)=>
            sum+bill.amount,
        0
    );

}
/*
==================================================
PayDay Control System 1.9.0

app.js

Part 2/4

Paycheck Engine
Bill Assignment
Waterfall Calculations
==================================================
*/


/*
==================================================
PAYCHECK GENERATION
==================================================
*/


function generatePaychecks(count){

    let checks=[];


    let date =
        cloneDate(
            PayDay.settings.nextPayDate
        );



    for(let i=0;i<count;i++){


        let start =
            cloneDate(date);


        let end =
            getPayPeriodEnd(start);



        checks.push({

            id:i,


            start:start,


            end:end,


            payDate:start,


            period:

                start.toLocaleDateString()
                +
                " - "
                +
                end.toLocaleDateString(),


            income:

                PayDay.settings.paycheckAmount


        });



        date =
            addDays(
                date,
                getPayInterval()
            );

    }



    return checks;

}





/*
==================================================
PAYCHECK NAVIGATION
==================================================
*/


function nextPaycheck(){

    let checks =
        generatePaychecks(24);



    if(
        PayDay.selectedPaycheck <
        checks.length-1
    ){

        PayDay.selectedPaycheck++;

    }



    renderPaycheck();

}




function previousPaycheck(){


    if(
        PayDay.selectedPaycheck > 0
    ){

        PayDay.selectedPaycheck--;

    }



    renderPaycheck();

}





/*
==================================================
BILL ASSIGNMENT ENGINE
==================================================
*/


function getBillsForPaycheck(check){


    let assigned=[];



    PayDay.bills.forEach(bill=>{


        let month =
            getMonthStart(
                check.start
            );


        let dueDate =
            getBillDate(
                bill,
                month
            );



        /*
        ==========================================
        FULL PAYMENT
        ==========================================
        */


        if(
            bill.paymentAllocation ===
            "Full Amount"
        ){


            if(
                isDateInRange(
                    dueDate,
                    check.start,
                    check.end
                )
            ){


                assigned.push({

                    ...bill,

                    assignedAmount:
                        bill.amount

                });


            }


        }




        /*
        ==========================================
        SPLIT BETWEEN PAYCHECKS
        ==========================================
        */


        if(
            bill.paymentAllocation ===
            "Split Between Paychecks"
        ){


            let monthChecks =
                generatePaychecks(30)
                .filter(pay=>{


                    return (

                        pay.start.getMonth()
                        ===
                        dueDate.getMonth()

                        &&

                        pay.start.getFullYear()
                        ===
                        dueDate.getFullYear()

                    );


                });



            let eligibleChecks =
                monthChecks.filter(pay=>{


                    return pay.start < dueDate;


                });



            let splitAmount =

                bill.amount /
                Math.max(
                    eligibleChecks.length,
                    1
                );




            let matching =

                eligibleChecks.find(pay=>{


                    return (

                        pay.start.getTime()
                        ===
                        check.start.getTime()

                    );


                });





            if(matching){


                assigned.push({

                    ...bill,

                    assignedAmount:
                        splitAmount

                });


            }


        }



    });



    return assigned;


}





/*
==================================================
WATERFALL CALCULATIONS
==================================================
*/


function calculatePriorityAmount(priority,bills){


    return bills

    .filter(
        bill=>
            bill.priority===priority
    )

    .reduce(
        (sum,bill)=>
            sum+bill.assignedAmount,
        0
    );


}





function calculatePaycheck(check){



    let bills =
        getBillsForPaycheck(check);



    let priority1 =
        calculatePriorityAmount(
            1,
            bills
        );


    let priority2 =
        calculatePriorityAmount(
            2,
            bills
        );


    let priority3 =
        calculatePriorityAmount(
            3,
            bills
        );





    let afterPriority1 =
        check.income -
        priority1;



    let afterPriority2 =
        afterPriority1 -
        priority2;



    let afterPriority3 =
        afterPriority2 -
        priority3;





    let remaining =

        afterPriority3
        -
        PayDay.settings.protectedSavings
        -
        PayDay.settings.protectedCash;






    return {


        bills,


        priority1,


        priority2,


        priority3,



        afterPriority1,


        afterPriority2,


        afterPriority3,



        savings:

            PayDay.settings.protectedSavings,



        cash:

            PayDay.settings.protectedCash,



        remaining,



        allocation:

            calculateAllocation(
                Math.max(
                    remaining,
                    0
                )
            ),



        status:

            remaining >= 0
            ?
            "Healthy"
            :
            "Shortfall"


    };


}






/*
==================================================
EXTRA CASH ALLOCATION
==================================================
*/


function calculateAllocation(amount){


    return {


        savings:

            amount *
            (
                PayDay.settings.allocation.savings /
                100
            ),



        debt:

            amount *
            (
                PayDay.settings.allocation.debt /
                100
            ),



        other:

            amount *
            (
                PayDay.settings.allocation.other /
                100
            )


    };


}




/*
==================================================
MONTH ENGINE
==================================================
*/


function getBillsForMonth(date){


    return PayDay.bills.filter(bill=>{


        let billDate =
            getBillDate(
                bill,
                date
            );


        return (

            billDate.getMonth()
            ===
            date.getMonth()

            &&

            billDate.getFullYear()
            ===
            date.getFullYear()

        );


    });


}





function changeMonth(amount){


    PayDay.selectedMonth =
        addMonths(
            PayDay.selectedMonth,
            amount
        );


    renderMonthly();


}
 /*
==================================================
PayDay Control System 1.9.0

app.js

Part 3/4

Navigation
Dashboard
Bills
Paycheck UI
==================================================
*/


/*
==================================================
NAVIGATION
==================================================
*/


function loadPage(page){


    switch(page){


        case "dashboard":

            renderDashboard();

        break;



        case "bills":

            renderBills();

        break;



        case "paycheck":

            renderPaycheck();

        break;



        case "monthly":

            renderMonthly();

        break;



        case "settings":

            renderSettings();

        break;



        default:

            renderDashboard();


    }


}





/*
==================================================
DASHBOARD
==================================================
*/


function renderDashboard(){


    let app =
        document.getElementById("app");



    let check =
        generatePaychecks(1)[0];



    let calc =
        calculatePaycheck(check);





    app.innerHTML = `


<div class="panel">


<h2>
PayDay Control Center
</h2>


<div class="status ${
    calc.status==="Healthy"
    ?
    ""
    :
    "warning"
}">

${calc.status}

</div>


</div>





<div class="grid">


<div class="panel">

<div class="card-label">

Next Paycheck

</div>


<div class="card-value">

${money(check.income)}

</div>


</div>





<div class="panel">

<div class="card-label">

Monthly Commitments

</div>


<div class="card-value">

${money(totalBills())}

</div>


</div>





<div class="panel">

<div class="card-label">

Remaining Cash

</div>


<div class="card-value">

${money(calc.remaining)}

</div>


</div>


</div>






<div class="panel">


<h3>

Upcoming Bills

</h3>



${
PayDay.bills
.slice(0,5)
.map(bill=>`

<div>

${bill.name}
-
${money(bill.amount)}
-
Due ${ordinal(bill.dueDay)}

</div>

`)
.join("")
}



</div>


`;



}







/*
==================================================
BILLS PAGE
==================================================
*/


function renderBills(){


    let app =
        document.getElementById("app");


    let html="";



    PayDay.bills.forEach(bill=>{


        html += `


<div class="bill-card">


<div class="bill-title">

${bill.name}

</div>


<div class="bill-detail">

Amount:
${money(bill.amount)}

</div>


<div class="bill-detail">

Due:
${ordinal(bill.dueDay)}

</div>


<div class="bill-detail">

Priority:
${bill.priority}

</div>


<div class="bill-detail">

Allocation:
${bill.paymentAllocation}

</div>



<div class="action-row">


<button onclick="editBill(${bill.id})">

Edit

</button>



<button class="danger"

onclick="deleteBill(${bill.id});renderBills()">

Delete

</button>


</div>



</div>


`;



});





app.innerHTML = `


<div class="panel">

<h2>

Bills

</h2>

</div>



${html}




<div class="panel">


<h2>

${PayDay.editingBill
?
"Edit Bill"
:
"Add Bill"
}

</h2>



<div class="form-grid">


<div>

<label>

Name

</label>

<input id="billName">

</div>




<div>

<label>

Amount

</label>

<input id="billAmount"
type="number">

</div>




<div>

<label>

Due Day

</label>

<input id="billDay"
type="number">

</div>





<div>

<label>

Priority

</label>


<select id="billPriority">


<option value="1">

Priority 1

</option>


<option value="2">

Priority 2

</option>


<option value="3">

Priority 3

</option>


</select>


</div>





<div>

<label>

Payment

</label>


<select id="billAllocation">


<option>

Full Amount

</option>


<option>

Split Between Paychecks

</option>


</select>


</div>



</div>



<button onclick="saveBillForm()">

Save Bill

</button>



</div>


`;



}






function editBill(id){


    let bill =
        PayDay.bills.find(
            b=>b.id===id
        );



    if(!bill)

        return;



    PayDay.editingBill=id;


    renderBills();



    setTimeout(()=>{


        document.getElementById("billName").value =
            bill.name;


        document.getElementById("billAmount").value =
            bill.amount;


        document.getElementById("billDay").value =
            bill.dueDay;


        document.getElementById("billPriority").value =
            bill.priority;


        document.getElementById("billAllocation").value =
            bill.paymentAllocation;


    },50);



}






function saveBillForm(){


    let data={


        name:
        document.getElementById("billName").value,


        amount:
        Number(
            document.getElementById("billAmount").value
        ),


        dueDay:
        Number(
            document.getElementById("billDay").value
        ),


        priority:
        Number(
            document.getElementById("billPriority").value
        ),


        paymentAllocation:
        document.getElementById("billAllocation").value


    };




    if(PayDay.editingBill){


        updateBill(
            PayDay.editingBill,
            data
        );


        PayDay.editingBill=null;


    }

    else{


        addBill(data);


    }



    renderBills();


}







/*
==================================================
PAYCHECK WATERFALL UI
==================================================
*/


function renderPaycheck(){


    let app =
        document.getElementById("app");



    let check =
        generatePaychecks(24)
        [
            PayDay.selectedPaycheck
        ];



    let calc =
        calculatePaycheck(check);




    app.innerHTML = `


<div class="panel">


<button onclick="previousPaycheck()">

Previous Paycheck

</button>



<button onclick="nextPaycheck()">

Next Paycheck

</button>




<h2>

${check.period}

</h2>


<h3>

Income:
${money(check.income)}

</h3>


</div>



${renderWaterfall(
"Priority 1 — Required Bills",
1,
calc
)}



${renderWaterfall(
"Priority 2 — Debt",
2,
calc
)}



${renderWaterfall(
"Priority 3 — Other",
3,
calc
)}






<div class="allocation">


<h3>

Extra Cash Allocation

</h3>



<div class="allocation-row">

Savings

<span>

${money(calc.allocation.savings)}

</span>

</div>




<div class="allocation-row">

Debt

<span>

${money(calc.allocation.debt)}

</span>

</div>



<div class="allocation-row">

Other

<span>

${money(calc.allocation.other)}

</span>

</div>


</div>


`;



}






function renderWaterfall(title,priority,calc){


    let bills =

        calc.bills.filter(
            b=>b.priority===priority
        );



    let total =

        bills.reduce(
            (sum,b)=>
            sum+b.assignedAmount,
            0
        );



    let remaining;



    if(priority===1)

        remaining=calc.afterPriority1;


    if(priority===2)

        remaining=calc.afterPriority2;


    if(priority===3)

        remaining=calc.afterPriority3;





    return `


<div class="waterfall">



<div class="waterfall-header"

onclick="toggleSection(this)">

▼ ${title}

</div>




<div class="waterfall-content">



${

bills.map(b=>`

<div class="waterfall-row">

<span>

${b.name}

</span>


<span>

${money(b.assignedAmount)}

</span>


</div>

`).join("")

}





<div class="waterfall-total">

Total:

${money(total)}

</div>




<div class="waterfall-total">

Remaining:

${money(remaining)}

</div>



</div>


</div>


`;



}




function toggleSection(element){


    let content =
        element.nextElementSibling;



    if(content.style.display==="none"){

        content.style.display="block";

    }

    else{

        content.style.display="none";

    }


}
 /*
==================================================
PayDay Control System 1.9.0

app.js

Part 4/4

Monthly Budget
Settings
Startup
==================================================
*/


/*
==================================================
MONTHLY BUDGET
==================================================
*/


function renderMonthly(){


    let app =
        document.getElementById("app");



    let month =
        PayDay.selectedMonth;



    let monthlyBills =
        getBillsForMonth(month);




    let income =

        PayDay.settings.payFrequency==="Bi-Weekly"

        ?

        PayDay.settings.paycheckAmount * 2

        :

        PayDay.settings.paycheckAmount;






    app.innerHTML = `


<div class="panel">


<button onclick="changeMonth(-1)">

Previous Month

</button>



<button onclick="changeMonth(1)">

Next Month

</button>




<h2>

${month.toLocaleString(

"default",

{

month:"long",

year:"numeric"

}

)}

</h2>



<h3>

Income:

${money(income)}

</h3>



</div>






${renderMonthlyPriority(1,monthlyBills)}



${renderMonthlyPriority(2,monthlyBills)}



${renderMonthlyPriority(3,monthlyBills)}






<div class="panel">


<h3>

Monthly Remaining

</h3>


<div class="card-value">

${money(

income -

monthlyBills.reduce(

(sum,b)=>sum+b.amount,

0

)

)}

</div>


</div>


`;



}






function renderMonthlyPriority(priority,bills){



    let filtered =

        bills.filter(
            b=>b.priority===priority
        );



    let total =

        filtered.reduce(
            (sum,b)=>
            sum+b.amount,
            0
        );




    return `


<div class="waterfall">


<div class="waterfall-header"

onclick="toggleSection(this)">


▼ Priority ${priority}


</div>




<div class="waterfall-content">



${

filtered.map(b=>`


<div class="waterfall-row">


<span>

${b.name}

</span>


<span>

${money(b.amount)}

</span>


</div>


`).join("")

}



<div class="waterfall-total">

Total:

${money(total)}

</div>



</div>



</div>


`;



}







/*
==================================================
SETTINGS
==================================================
*/


function renderSettings(){


    let app =
        document.getElementById("app");



    app.innerHTML = `


<div class="panel">


<h2>

Settings

</h2>



<label>

Paycheck Amount

</label>


<input

id="payAmount"

value="${PayDay.settings.paycheckAmount}"

>




<label>

Pay Frequency

</label>



<select id="frequency">


<option

${PayDay.settings.payFrequency==="Weekly"?"selected":""}>

Weekly

</option>



<option

${PayDay.settings.payFrequency==="Bi-Weekly"?"selected":""}>

Bi-Weekly

</option>



<option

${PayDay.settings.payFrequency==="Monthly"?"selected":""}>

Monthly

</option>



</select>






<label>

Minimum Savings

</label>


<input

id="protectedSavings"

value="${PayDay.settings.protectedSavings}"

>






<label>

Minimum Leftover Cash

</label>


<input

id="protectedCash"

value="${PayDay.settings.protectedCash}"

>







<h3>

Extra Cash Allocation

</h3>




<label>

Savings %

</label>


<input

id="allocSavings"

value="${PayDay.settings.allocation.savings}"

>




<label>

Debt %

</label>


<input

id="allocDebt"

value="${PayDay.settings.allocation.debt}"

>




<label>

Other %

</label>


<input

id="allocOther"

value="${PayDay.settings.allocation.other}"

>





<button onclick="saveSettings()">

Save Settings

</button>



</div>


`;



}






function saveSettings(){


    let total =

        Number(
            document.getElementById("allocSavings").value
        )

        +

        Number(
            document.getElementById("allocDebt").value
        )

        +

        Number(
            document.getElementById("allocOther").value
        );




    if(total!==100){


        alert(
            "Allocation percentages must equal 100%"
        );


        return;


    }






    PayDay.settings.paycheckAmount =

        Number(
            document.getElementById("payAmount").value
        );





    PayDay.settings.payFrequency =

        document.getElementById("frequency").value;






    PayDay.settings.protectedSavings =

        Number(
            document.getElementById("protectedSavings").value
        );





    PayDay.settings.protectedCash =

        Number(
            document.getElementById("protectedCash").value
        );







    PayDay.settings.allocation = {


        savings:

            Number(
                document.getElementById("allocSavings").value
            ),



        debt:

            Number(
                document.getElementById("allocDebt").value
            ),



        other:

            Number(
                document.getElementById("allocOther").value
            )


    };






    saveData();



    alert(
        "Settings Saved"
    );


}







/*
==================================================
STARTUP
==================================================
*/


function startApp(){


    loadData();



    loadPage("dashboard");


}



startApp();