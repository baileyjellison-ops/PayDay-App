/*
==================================================
PayDay Version 1.8.5

app.js

Part 1/3

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



// Current paycheck being viewed

selectedPaycheck:0,



// Current month being viewed

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


PayDay.settings={


...PayDay.settings,


...JSON.parse(settings)


};



}



if(bills){


PayDay.bills =

JSON.parse(bills)

.map(

bill=>createBill(bill)

);



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
DATE ENGINE
==================================================
*/


function cloneDate(date){


return new Date(

date.getTime()

);



}





function addDays(date,days){


let result=

cloneDate(date);



result.setDate(

result.getDate()+days

);



return result;



}





function getPayInterval(){


switch(
PayDay.settings.payFrequency
){


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

date >= start

&&

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





function getMonthEnd(date){


return new Date(

date.getFullYear(),

date.getMonth()+1,

0

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



status:

data.status||

"Upcoming",



/*
Full Amount
or
Split Between Paychecks
*/


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


let bill=

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
PayDay Version 1.8.5

app.js

Part 2/3

Paycheck Engine
Bill Assignment
Waterfall Logic
==================================================
*/


/*
==================================================
PAYCHECK GENERATION
==================================================
*/


function generatePaychecks(count){


let checks=[];


let date=

cloneDate(
PayDay.settings.nextPayDate
);



for(

let i=0;

i<count;

i++

){


let start=

cloneDate(date);



let end=

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



date=

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


let max=

generatePaychecks(24).length-1;



if(

PayDay.selectedPaycheck < max

){


PayDay.selectedPaycheck++;



}



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
BILL ASSIGNMENT ENGINE
==================================================
*/


function getBillsForPaycheck(check){



let assigned=[];



PayDay.bills.forEach(

bill=>{


let month =

new Date(

check.start.getFullYear(),

check.start.getMonth(),

1

);



let dueDate=

getBillDate(

bill,

month

);



/*
FULL AMOUNT

Assigned when due date
falls inside paycheck
*/

if(

bill.paymentAllocation==="Full Amount"

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
SPLIT BETWEEN PAYCHECKS

Divide between checks
before due date
*/

else if(

bill.paymentAllocation==="Split Between Paychecks"

){



let monthChecks=

generatePaychecks(4)

.filter(

p=>

p.start.getMonth()===dueDate.getMonth()

||
p.end.getMonth()===dueDate.getMonth()

);



let validChecks=

monthChecks.filter(

p=>

p.start < dueDate

);



let splitAmount=

bill.amount /

Math.max(

validChecks.length,

1

);



let exists=

validChecks.find(

p=>

p.id===check.id

);



if(exists){



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
WATERFALL TOTALS
==================================================
*/


function paycheckPriorityTotal(priority,check){


return getBillsForPaycheck(check)

.filter(

bill=>

bill.priority===priority

)

.reduce(

(sum,bill)=>

sum+

bill.assignedAmount,

0

);



}





function calculatePaycheck(check){



let bills=

getBillsForPaycheck(check);



let priority1=

paycheckPriorityTotal(

1,

check

);



let priority2=

paycheckPriorityTotal(

2,

check

);



let priority3=

paycheckPriorityTotal(

3,

check

);



let remaining=

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



return{


bills,


priority1,


priority2,


priority3,


savings:

PayDay.settings.protectedSavings,


cash:

PayDay.settings.protectedCash,


remaining,


allocation:

calculateAllocation(

remaining

),



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


return{


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
PayDay Version 1.8.5

app.js

Part 3/3

UI
Navigation
Startup
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


let app=document.getElementById("app");


let paycheck=

generatePaychecks(1)[0];


let calc=

calculatePaycheck(paycheck);



app.innerHTML=`


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

<div>

Next Paycheck

</div>

<div class="card-value">

${money(paycheck.income)}

</div>

</div>



<div class="panel">

<div>

Monthly Bills

</div>

<div class="card-value">

${money(totalBills())}

</div>

</div>



<div class="panel">

<div>

Remaining

</div>

<div class="card-value">

${money(calc.remaining)}

</div>

</div>


</div>


`;



}



/*
==================================================
BILLS PAGE
==================================================
*/


function renderBills(){


let app=document.getElementById("app");


let html="";



PayDay.bills.forEach(bill=>{


html+=`

<div class="panel">


<h3>

${bill.name}

</h3>


<p>

Amount:

${money(bill.amount)}

</p>


<p>

Due:

${ordinal(bill.dueDay)}

</p>


<p>

Priority:

${bill.priority}

</p>


<p>

Allocation:

${bill.paymentAllocation}

</p>



<button onclick="deleteBill(${bill.id});renderBills()">

Delete

</button>


</div>


`;



});



app.innerHTML=`

<div class="panel">

<h2>Bills</h2>

</div>


${html}



<div class="panel">

<h2>Add Bill</h2>


<input id="newName" placeholder="Name">


<input id="newAmount" placeholder="Amount">


<input id="newDue" placeholder="Due Day">


<select id="newPriority">

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



<select id="newAllocation">


<option>

Full Amount

</option>


<option>

Split Between Paychecks

</option>


</select>



<button onclick="saveNewBill()">

Save

</button>


</div>

`;



}





function saveNewBill(){


addBill({


name:

document.getElementById("newName").value,


amount:

Number(
document.getElementById("newAmount").value
),


dueDay:

Number(
document.getElementById("newDue").value
),


priority:

Number(
document.getElementById("newPriority").value
),


paymentAllocation:

document.getElementById("newAllocation").value



});



renderBills();



}





/*
==================================================
PAYCHECK PAGE
==================================================
*/


function renderPaycheck(){


let app=document.getElementById("app");


let check=

generatePaychecks(24)

[PayDay.selectedPaycheck];



let calc=

calculatePaycheck(check);



app.innerHTML=`


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


${

renderPaycheckSection(

"Priority 1 — Required",

1,

check

)

}



${

renderPaycheckSection(

"Priority 2 — Debt",

2,

check

)

}



${

renderPaycheckSection(

"Priority 3 — Other",

3,

check

)

}



<div class="panel">

<h3>

Extra Allocation

</h3>


<p>

Savings:

${money(calc.allocation.savings)}

</p>


<p>

Debt:

${money(calc.allocation.debt)}

</p>


<p>

Other:

${money(calc.allocation.other)}

</p>


</div>


`;



}





function renderPaycheckSection(title,priority,check){


let bills=

getBillsForPaycheck(check)

.filter(

b=>b.priority===priority

);



return `


<div class="waterfall">


<div class="waterfall-header">

${title}

</div>



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



</div>


`;



}





/*
==================================================
MONTHLY BUDGET
==================================================
*/


function renderMonthly(){


let app=document.getElementById("app");


let month=

PayDay.selectedMonth;



app.innerHTML=`

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


</div>



${

renderMonthlyPriority(

1

)

}



${

renderMonthlyPriority(

2

)

}



${

renderMonthlyPriority(

3

)

}


`;



}





function changeMonth(amount){


PayDay.selectedMonth.setMonth(

PayDay.selectedMonth.getMonth()+amount

);


renderMonthly();



}





function renderMonthlyPriority(priority){


return `


<div class="panel">


<h3>

Priority ${priority}

</h3>



${

billsByPriority(priority)

.map(

b=>`

<p>

${b.name}

-

${money(b.amount)}

</p>

`

).join("")

}



</div>


`;



}





/*
==================================================
SETTINGS
==================================================
*/


function renderSettings(){


let app=document.getElementById("app");


app.innerHTML=`

<div class="panel">


<h2>

Settings

</h2>


<p>

Allocation:

${PayDay.settings.allocation.savings}% Savings

${PayDay.settings.allocation.debt}% Debt

${PayDay.settings.allocation.other}% Other

</p>


</div>


`;



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