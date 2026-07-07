/*
==================================================
PayDay Version 1.8.3
app.js

Part 1/3

Core Engine
Storage
Data Models
Calculations
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


        paycheckAmount: 2184,


        payFrequency: "Bi-Weekly",


        nextPayDate: new Date(),


        savingsMinimum: 100,


        leftoverTarget: 150,


        displayMode: "standard"


    },


    bills: [],


    selectedPaycheck: 0,


    selectedMonth: new Date(),


    editingBill: null


};



/*
==================================================
STORAGE
==================================================
*/


const STORAGE_KEYS = {


    settings:
    "payday_settings",


    bills:
    "payday_bills"


};




function saveData(){


    localStorage.setItem(

        STORAGE_KEYS.settings,

        JSON.stringify(
            PayDay.settings
        )

    );



    localStorage.setItem(

        STORAGE_KEYS.bills,

        JSON.stringify(
            PayDay.bills
        )

    );


}





function loadData(){


    let savedSettings =

    localStorage.getItem(
        STORAGE_KEYS.settings
    );



    let savedBills =

    localStorage.getItem(
        STORAGE_KEYS.bills
    );



    if(savedSettings){


        PayDay.settings = {


            ...PayDay.settings,


            ...JSON.parse(savedSettings)


        };


    }



    if(savedBills){


        PayDay.bills =

        JSON.parse(savedBills);


    }


}



/*
==================================================
HELPERS
==================================================
*/


function money(value){


    return Number(value)
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

    Math.floor(
        Math.random()*1000
    );


}





function ordinal(day){


    if(day > 3 && day < 21)

        return day + "th";


    switch(day % 10){


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
BILL DATA MODEL
==================================================
*/


function createBill(data){


    return {


        id:

        data.id ||

        createID(),



        name:

        data.name || "New Bill",



        amount:

        Number(data.amount)||0,



        dueDay:

        Number(data.dueDay)||1,



        category:

        data.category || "Other",



        priority:

        Number(data.priority)||1,



        recurrence:

        data.recurrence || "Monthly",



        assignment:

        data.assignment || "Auto",



        status:

        data.status || "Upcoming"


    };


}



/*
==================================================
SAMPLE DATA
==================================================
*/


function loadSampleData(){


PayDay.bills = [


createBill({

name:"Rent",

amount:1150,

dueDay:1,

category:"Housing",

priority:1

}),



createBill({

name:"Mom",

amount:200,

dueDay:1,

category:"Family",

priority:1

}),



createBill({

name:"Student Loan 1",

amount:100,

dueDay:5,

category:"Loan",

priority:1

}),



createBill({

name:"Spotify",

amount:12,

dueDay:12,

category:"Subscription",

priority:3

}),



createBill({

name:"Electric",

amount:75,

dueDay:16,

category:"Utility",

priority:1

}),



createBill({

name:"Student Loan 2",

amount:238,

dueDay:18,

category:"Loan",

priority:1

}),



createBill({

name:"JCPenney",

amount:50,

dueDay:18,

category:"Debt",

priority:2

}),



createBill({

name:"Credit Card",

amount:300,

dueDay:22,

category:"Debt",

priority:2

}),



createBill({

name:"Personal Loan",

amount:444,

dueDay:28,

category:"Debt",

priority:2

})


];



saveData();



alert(
"Sample Budget Loaded"
);


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

b=>

b.id !== id

);



saveData();


}



/*
==================================================
BILL CALCULATIONS
==================================================
*/


function totalBills(){


return PayDay.bills.reduce(

(total,bill)=>

total + Number(bill.amount),

0

);


}





function billsByPriority(priority){


return PayDay.bills.filter(

bill =>

bill.priority === priority

);


}





function priorityTotal(priority){


return billsByPriority(priority)

.reduce(

(total,bill)=>

total + bill.amount,

0

);


}
/*
==================================================
PayDay Version 1.8.3
app.js

Part 2/3

Dashboard
Bills HMI Interface
Bill Management
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



case "reports":

renderReports();

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



let checks =
generatePaychecks(1);



let result =
calculatePaycheck(
checks[0]
);



app.innerHTML = `


<div class="panel">


<h2>

PayDay Control Center

</h2>



<div class="status">

${result.status}

</div>


</div>




<div class="grid">



<div class="panel">


<div class="card-label">

Next Paycheck

</div>


<div class="card-value">

${money(
checks[0].income
)}

</div>


</div>





<div class="panel">


<div class="card-label">

Monthly Bills

</div>


<div class="card-value">

${money(
totalBills()
)}

</div>


</div>





<div class="panel">


<div class="card-label">

Available After Commitments

</div>


<div class="card-value">

${money(
result.remaining
)}

</div>


</div>



</div>




<div class="panel">


<h3>

Upcoming Bills

</h3>


${renderUpcomingBills()}


</div>


`;



}




function renderUpcomingBills(){


let html="";



PayDay.bills

.slice(0,5)

.forEach(

bill=>{


html += `


<p>

<b>${bill.name}</b>

-

${money(bill.amount)}

-

Due ${ordinal(bill.dueDay)}

</p>


`;


});


return html;


}



/*
==================================================
BILLS PAGE
==================================================
*/


function renderBills(){


let app =
document.getElementById("app");



let cards="";



PayDay.bills.forEach(

bill=>{


cards += `


<div class="panel">



<h2>

${bill.name}

</h2>



<div class="grid">


<div>

<div class="card-label">

Amount

</div>


<div class="card-value">

${money(bill.amount)}

</div>


</div>





<div>


<div class="card-label">

Due Date

</div>


<p>

${ordinal(bill.dueDay)}

</p>


</div>





<div>


<div class="card-label">

Frequency

</div>


<p>

${bill.recurrence}

</p>


</div>





<div>


<div class="card-label">

Priority

</div>


<p>

${bill.priority}

</p>


</div>




<div>


<div class="card-label">

Status

</div>


<p>

${bill.status}

</p>


</div>


</div>





<div class="action-row">


<button

onclick="editBill(${bill.id})">

Edit

</button>




<button

class="danger"

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



${cards}



<div class="panel">


<h2>

${PayDay.editingBill ?

"Edit Bill"

:

"Add Bill"}

</h2>



<div class="form-grid">


<div>

<label>

Bill Name

</label>


<input id="billName">


</div>




<div>

<label>

Amount

</label>


<input

id="billAmount"

type="number">


</div>




<div>

<label>

Due Day

</label>


<input

id="billDay"

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

Frequency

</label>


<select id="billRecurrence">


<option>

Monthly

</option>


<option>

Weekly

</option>


<option>

Bi-Weekly

</option>


<option>

One-Time

</option>


</select>


</div>



<div>

<label>

Assignment

</label>


<select id="billAssignment">


<option>

Auto

</option>


<option>

Manual

</option>


</select>


</div>



</div>



<button

onclick="saveBillForm()">

Save Bill

</button>


</div>


`;



}





/*
==================================================
EDIT BILL
==================================================
*/


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



document.getElementById("billRecurrence").value =
bill.recurrence;



document.getElementById("billAssignment").value =
bill.assignment;



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


recurrence:

document.getElementById("billRecurrence").value,


assignment:

document.getElementById("billAssignment").value


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
PayDay Version 1.8.3
app.js

Part 3/3

Paycheck Waterfall
Monthly
Reports
Settings
Startup
==================================================
*/


/*
==================================================
PAYCHECK ENGINE
==================================================
*/


function generatePaychecks(count){


let checks=[];


let date =
new Date(
PayDay.settings.nextPayDate
);



let days =

PayDay.settings.payFrequency==="Weekly"

?

7

:

PayDay.settings.payFrequency==="Monthly"

?

30

:

14;



for(

let i=0;

i<count;

i++

){


let start =
new Date(date);



let end =
new Date(date);



end.setDate(

end.getDate()+days-1

);



checks.push({


id:i,


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



date.setDate(

date.getDate()+days

);



}



return checks;


}





function calculatePaycheck(check){



let p1 =
priorityTotal(1);



let p2 =
priorityTotal(2);



let p3 =
priorityTotal(3);



let savings =
PayDay.settings.savingsMinimum;



let cash =
PayDay.settings.leftoverTarget;



let remaining =

check.income

-

p1

-

p2

-

p3

-

savings

-

cash;



return {


priority1:p1,


priority2:p2,


priority3:p3,


savings,


cash,


remaining,


status:

remaining >= 0

?

"Healthy"

:

"Shortfall",


period:

check.period



};


}



/*
==================================================
PAYCHECK WATERFALL DISPLAY
==================================================
*/


function renderPaycheck(){


let app =
document.getElementById("app");



let checks =
generatePaychecks(12);



let check =
checks[
PayDay.selectedPaycheck
];



let result =
calculatePaycheck(check);



app.innerHTML = `


<div class="panel">


<h2>

Paycheck Planner

</h2>



<button onclick="previousPaycheck()">

Previous

</button>


<button onclick="nextPaycheck()">

Next

</button>


<h3>

${check.period}

</h3>


</div>





<div class="panel">


<h3>

Starting Balance

</h3>


<div class="card-value">

${money(check.income)}

</div>


</div>






<div class="panel">


<h3>

Priority 1 Bills

</h3>


<p>

${money(result.priority1)}

</p>



<h3>

Remaining

</h3>


<p>

${money(
check.income-result.priority1
)}

</p>


</div>





<div class="panel">


<h3>

Priority 2 Bills

</h3>


<p>

${money(result.priority2)}

</p>



<h3>

Remaining

</h3>


<p>

${money(

check.income

-

result.priority1

-

result.priority2

)}

</p>


</div>






<div class="panel">


<h3>

Priority 3 Bills

</h3>


<p>

${money(result.priority3)}

</p>



<h3>

Remaining

</h3>


<p>

${money(

check.income

-

result.priority1

-

result.priority2

-

result.priority3

)}

</p>


</div>





<div class="panel">


<h3>

Protected Savings

</h3>


<p>

${money(result.savings)}

</p>



<h3>

Protected Cash

</h3>


<p>

${money(result.cash)}

</p>



<h2>

FINAL AVAILABLE

</h2>


<div class="card-value">

${money(result.remaining)}

</div>


<div class="status">

${result.status}

</div>


</div>


`;



}





function nextPaycheck(){


PayDay.selectedPaycheck++;


renderPaycheck();


}





function previousPaycheck(){


if(
PayDay.selectedPaycheck>0
)

PayDay.selectedPaycheck--;



renderPaycheck();


}



/*
==================================================
MONTHLY BUDGET
==================================================
*/


function renderMonthly(){


let app =
document.getElementById("app");



let income =

PayDay.settings.payFrequency==="Bi-Weekly"

?

PayDay.settings.paycheckAmount*2

:

PayDay.settings.paycheckAmount;



app.innerHTML = `


<div class="panel">


<h2>

Monthly Budget

</h2>


</div>



<div class="grid">


<div class="panel">

<div class="card-label">

Income

</div>


<div class="card-value">

${money(income)}

</div>


</div>



<div class="panel">


<div class="card-label">

Bills

</div>


<div class="card-value">

${money(totalBills())}

</div>


</div>



<div class="panel">


<div class="card-label">

Remaining

</div>


<div class="card-value">

${money(

income-totalBills()

)}

</div>


</div>


</div>


`;



}



/*
==================================================
REPORTS
==================================================
*/


function renderReports(){


document.getElementById("app").innerHTML = `


<div class="panel">


<h2>

Reports

</h2>



<p>

Total Bills:

${money(totalBills())}

</p>



<p>

Priority 1:

${money(priorityTotal(1))}

</p>



<p>

Priority 2:

${money(priorityTotal(2))}

</p>



<p>

Priority 3:

${money(priorityTotal(3))}

</p>


</div>


`;


}



/*
==================================================
SETTINGS
==================================================
*/


function renderSettings(){


document.getElementById("app").innerHTML = `


<div class="panel">


<h2>

Settings

</h2>



<label>

Paycheck Amount

</label>


<input id="payAmount"

value="${PayDay.settings.paycheckAmount}">



<label>

Next Pay Date

</label>


<input

type="date"

id="nextPay">



<label>

Savings Minimum

</label>


<input id="saveAmount"

value="${PayDay.settings.savingsMinimum}">



<label>

Protected Cash

</label>


<input id="cashAmount"

value="${PayDay.settings.leftoverTarget}">



<button onclick="saveSettingsForm()">

Save

</button>



</div>


`;



}




function saveSettingsForm(){


PayDay.settings.paycheckAmount =

Number(

document.getElementById("payAmount").value

);



PayDay.settings.savingsMinimum =

Number(

document.getElementById("saveAmount").value

);



PayDay.settings.leftoverTarget =

Number(

document.getElementById("cashAmount").value

);



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



if(

PayDay.bills.length===0

){


loadSampleData();


}



loadPage("dashboard");


}



startApp();