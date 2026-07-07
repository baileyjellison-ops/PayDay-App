/*
==================================================
PayDay Version 1.8.2
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


const STORAGE = {


    settings:
    "payday_settings",


    bills:
    "payday_bills"


};



function saveData(){


    localStorage.setItem(

        STORAGE.settings,

        JSON.stringify(
            PayDay.settings
        )

    );


    localStorage.setItem(

        STORAGE.bills,

        JSON.stringify(
            PayDay.bills
        )

    );


}



function loadData(){


    let settings =

    localStorage.getItem(
        STORAGE.settings
    );



    let bills =

    localStorage.getItem(
        STORAGE.bills
    );



    if(settings){


        PayDay.settings = {

            ...PayDay.settings,

            ...JSON.parse(settings)

        };


    }



    if(bills){


        PayDay.bills =

        JSON.parse(bills);


    }



}



/*
==================================================
UTILITY FUNCTIONS
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


    return Date.now();

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

        data.name || "New Bill",



        amount:

        Number(data.amount) || 0,



        dueDay:

        Number(data.dueDay) || 1,



        category:

        data.category || "Other",



        priority:

        Number(data.priority) || 1,



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

}),



createBill({

name:"Mom",

amount:200,

dueDay:1,

category:"Family",

priority:1

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

b=>b.id!==id

);



saveData();


}



/*
==================================================
BILL TOTALS
==================================================
*/


function totalBills(){


return PayDay.bills.reduce(

(total,bill)=>

total + bill.amount,

0

);


}



function totalByPriority(priority){


return PayDay.bills

.filter(

b=>b.priority===priority

)

.reduce(

(total,bill)=>

total + bill.amount,

0

);


}
/*
==================================================
PayDay Version 1.8.2
app.js
Part 2/3

Dashboard
Bills
Paycheck Planner
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
Paycheck
</div>

<div class="card-value">

${money(
PayDay.settings.paycheckAmount
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
Available
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
Current Paycheck Period
</h3>


<p>

${result.period}

</p>


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



let rows = "";



PayDay.bills.forEach(bill=>{


rows += `


<tr>


<td>
${bill.name}
</td>


<td>
${money(bill.amount)}
</td>


<td>
${bill.recurrence}
</td>


<td>
${bill.status}
</td>


<td>


<div class="action-row">


<button class="small-button"

onclick="editBill(${bill.id})">

Edit

</button>



<button class="small-button danger"

onclick="deleteBill(${bill.id});renderBills()">

Delete

</button>


</div>


</td>


</tr>


`;


});



app.innerHTML = `


<div class="panel">


<h2>

Bills

</h2>



<table>


<tr>

<th>
Bill
</th>

<th>
Amount
</th>

<th>
Frequency
</th>

<th>
Status
</th>

<th>
Actions
</th>


</tr>


${rows}


</table>


</div>



<div class="panel">


<h2>

${PayDay.editingBill ? "Edit Bill":"Add Bill"}

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
Recurrence
</label>


<select id="billRecurrence">


<option>
One-Time
</option>

<option>
Weekly
</option>

<option>
Bi-Weekly
</option>

<option>
Monthly
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



<button onclick="saveBillForm()">

Save Bill

</button>


</div>


`;



}



/*
==================================================
BILL FORM
==================================================
*/


function saveBillForm(){


let data = {


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


document.getElementById("billName").value=bill.name;


document.getElementById("billAmount").value=bill.amount;


document.getElementById("billDay").value=bill.dueDay;


document.getElementById("billPriority").value=bill.priority;


document.getElementById("billRecurrence").value=bill.recurrence;


document.getElementById("billAssignment").value=bill.assignment;



},50);



}



/*
==================================================
PAYCHECK PLANNER
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



app.innerHTML=`


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

${check.payDate.toLocaleDateString()}

</h3>


</div>



<div class="panel">


<p>
Income:
${money(check.income)}
</p>


<p>
Bills:
${money(result.bills)}
</p>


<p>
Savings:
${money(result.savings)}
</p>


<h3>

Remaining:

${money(result.remaining)}

</h3>


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
){

PayDay.selectedPaycheck--;

}


renderPaycheck();


}
/*
==================================================
PayDay Version 1.8.2
app.js
Part 3/3

Monthly
Reports
Settings
Engine
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
?7
:
PayDay.settings.payFrequency==="Monthly"
?30
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


let bills =
PayDay.bills;



let billTotal =
bills.reduce(

(t,b)=>

t+b.amount,

0

);



let savings =
PayDay.settings.savingsMinimum;



let leftover =
PayDay.settings.leftoverTarget;



let remaining =

check.income

-

billTotal

-

savings

-

leftover;



return {


bills:billTotal,


savings,


remaining,


period:

check.period,


status:

remaining >=0
?
"Healthy"
:
"Shortfall"



};


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

PayDay.settings.paycheckAmount *

(
PayDay.settings.payFrequency==="Weekly"
?
4
:
2
);



let bills =
totalBills();



app.innerHTML=`


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

${money(bills)}

</div>


</div>



<div class="panel">


<div class="card-label">

Remaining

</div>


<div class="card-value">

${money(income-bills)}

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


let app =
document.getElementById("app");



app.innerHTML=`


<div class="panel">


<h2>

Reports

</h2>


<p>

Total Monthly Bills:

<b>

${money(totalBills())}

</b>

</p>



<p>

Paycheck Amount:

<b>

${money(
PayDay.settings.paycheckAmount
)}

</b>

</p>



<p>

Savings Minimum:

<b>

${money(
PayDay.settings.savingsMinimum
)}

</b>

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


let app =
document.getElementById("app");



app.innerHTML=`


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

Pay Frequency

</label>


<select id="payFrequency">


<option>
Weekly
</option>


<option selected>
Bi-Weekly
</option>


<option>
Monthly
</option>


</select>



<label>

Next Pay Date

</label>


<input

type="date"

id="nextPay"

value="${formatInputDate(
PayDay.settings.nextPayDate
)}">



<label>

Savings Minimum

</label>


<input

id="saveMinimum"

value="${PayDay.settings.savingsMinimum}">



<label>

Protected Leftover Cash

</label>


<input

id="cashTarget"

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



PayDay.settings.payFrequency =

document.getElementById("payFrequency").value;



PayDay.settings.nextPayDate =

document.getElementById("nextPay").value;



PayDay.settings.savingsMinimum =

Number(
document.getElementById("saveMinimum").value
);



PayDay.settings.leftoverTarget =

Number(
document.getElementById("cashTarget").value
);



saveData();



alert(
"Settings Saved"
);


}




/*
==================================================
DISPLAY MODE
==================================================
*/


function setDisplayMode(mode){


PayDay.settings.displayMode =
mode;


saveData();



if(mode==="graphic"){

document.body.classList.add(
"graphic"
);

}

else{

document.body.classList.remove(
"graphic"
);

}


}




/*
==================================================
HELPERS
==================================================
*/


function formatInputDate(date){


let d =
new Date(date);


return d.toISOString()
.split("T")[0];


}



/*
==================================================
START APPLICATION
==================================================
*/


function startApp(){


loadData();



if(
PayDay.bills.length===0
){


loadSampleData();


}



loadPage(
"dashboard"
);



}



startApp();