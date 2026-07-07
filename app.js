/*
==================================================
PayDay Version 1.8.4
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


settings:{


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


return Date.now()

+

Math.floor(
Math.random()*1000
);


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
BILL MODEL
==================================================
*/


function createBill(data){



return{


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

data.category||

"Other",



recurrence:

data.recurrence||

"Monthly",



assignment:

data.assignment||

"Auto",



status:

data.status||

"Upcoming"



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

b=>

b.id!==id

);



saveData();



}



/*
==================================================
BILL GROUPING
==================================================
*/


function billsByPriority(priority){


return PayDay.bills.filter(

bill=>

bill.priority===priority

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





function totalBills(){


return PayDay.bills.reduce(

(sum,bill)=>

sum+bill.amount,

0

);



}
/*
==================================================
PayDay Version 1.8.4
app.js

Part 2/3

Navigation
Dashboard
Bills
Paycheck Interface
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



let paycheck =

generatePaychecks(1)[0];



let calc =

calculatePaycheck(
paycheck
);



app.innerHTML = `



<div class="panel">


<h2>

PayDay Control Center

</h2>



<div class="status">

${calc.status}

</div>


</div>





<div class="grid">


<div class="panel">


<div class="card-label">

Next Paycheck

</div>


<div class="card-value">

${money(
paycheck.income
)}

</div>


</div>




<div class="panel">


<div class="card-label">

Monthly Commitments

</div>


<div class="card-value">

${money(
totalBills()
)}

</div>


</div>




<div class="panel">


<div class="card-label">

Unallocated Cash

</div>


<div class="card-value">

${money(
calc.remaining
)}

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
.map(

bill=>`

<p>

<b>${bill.name}</b>

-

${money(bill.amount)}

-

Due ${ordinal(bill.dueDay)}

</p>

`

)
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



let cards = "";



PayDay.bills.forEach(

bill=>{


cards += `



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

Frequency:

${bill.recurrence}

</div>



<div class="bill-detail">

Assignment:

${bill.assignment}

</div>



<div class="bill-detail">

Status:

${bill.status}

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


document.getElementById("billName").value=bill.name;


document.getElementById("billAmount").value=bill.amount;


document.getElementById("billDay").value=bill.dueDay;


document.getElementById("billPriority").value=bill.priority;


document.getElementById("billRecurrence").value=bill.recurrence;



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

document.getElementById("billRecurrence").value



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
PAYCHECK PAGE FRAMEWORK
==================================================
*/


function renderPaycheck(){


let app =
document.getElementById("app");



let paycheck =

generatePaychecks(12)

[

PayDay.selectedPaycheck

];



let calc =

calculatePaycheck(
paycheck
);



app.innerHTML = `



<div class="panel">


<h2>

Paycheck Planner

</h2>


<h3>

${paycheck.period}

</h3>


</div>




${

renderWaterfallSection(

"Priority 1 — Required Bills",

1

)

}



${

renderWaterfallSection(

"Priority 2 — Debt",

2

)

}



${

renderWaterfallSection(

"Priority 3 — Optional",

3

)

}



<div class="panel">


<h2>

Extra Cash Allocation

</h2>


</div>



`;



}





function renderWaterfallSection(title,priority){


let bills =

billsByPriority(priority);



return `


<div class="waterfall">


<div class="waterfall-header"

onclick="toggleSection(this)">


▼ ${title}


</div>



<div class="waterfall-content">


${

bills.map(

bill=>`


<div class="waterfall-row">


<span>

${bill.name}

</span>


<span>

${money(bill.amount)}

</span>


</div>


`

).join("")

}



<div class="waterfall-total">


Total:

${money(priorityTotal(priority))}


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
PayDay Version 1.8.4
app.js

Part 3/3

Calculations
Allocation Engine
Monthly Budget
Settings
Startup
==================================================
*/


/*
==================================================
PAYCHECK GENERATOR
==================================================
*/


function generatePaychecks(count){


let checks=[];


let date =
new Date(
PayDay.settings.nextPayDate
);



let interval =

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

end.getDate()+interval-1

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

date.getDate()+interval

);



}



return checks;


}





/*
==================================================
PAYCHECK CALCULATIONS
==================================================
*/


function calculatePaycheck(check){



let priority1 =

priorityTotal(1);



let priority2 =

priorityTotal(2);



let priority3 =

priorityTotal(3);



let remaining =

check.income

-

priority1

-

priority2

-

priority3

-

PayDay.settings.protectedSavings

-

PayDay.settings.protectedCash;



let allocation =

calculateAllocation(
remaining
);



return {


priority1,


priority2,


priority3,


savings:

PayDay.settings.protectedSavings,


cash:

PayDay.settings.protectedCash,


remaining,


allocation,


status:

remaining>=0

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



let split =

PayDay.settings.allocation;



return {


savings:

amount *

(split.savings/100),



debt:

amount *

(split.debt/100),



other:

amount *

(split.other/100)



};



}





function allocationTotal(){


return (

Number(
PayDay.settings.allocation.savings
)

+

Number(
PayDay.settings.allocation.debt
)

+

Number(
PayDay.settings.allocation.other
)

);



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


<h3>

Income:

${money(income)}

</h3>


</div>





${

renderWaterfallSection(

"Priority 1 — Required Bills",

1

)

}





${

renderWaterfallSection(

"Priority 2 — Debt",

2

)

}





${

renderWaterfallSection(

"Priority 3 — Optional",

3

)

}





<div class="panel">


<h3>

Total Monthly Commitments

</h3>


<div class="card-value">

${money(totalBills())}

</div>


<h3>

Remaining

</h3>


<div class="card-value">


${money(

income-totalBills()

)}

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


<input id="payAmount"

value="${PayDay.settings.paycheckAmount}">





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

Protected Savings

</label>


<input id="protectedSavings"

value="${PayDay.settings.protectedSavings}">





<label>

Protected Cash

</label>


<input id="protectedCash"

value="${PayDay.settings.protectedCash}">



<h3>

Extra Cash Allocation

</h3>



<label>

Savings %

</label>


<input id="allocSavings"

value="${PayDay.settings.allocation.savings}">



<label>

Debt %

</label>


<input id="allocDebt"

value="${PayDay.settings.allocation.debt}">



<label>

Other %

</label>


<input id="allocOther"

value="${PayDay.settings.allocation.other}">



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



if(

PayDay.bills.length===0

){


loadSampleData();


}



loadPage("dashboard");


}



startApp();