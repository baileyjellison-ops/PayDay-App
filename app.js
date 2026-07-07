/*
PAYDAY VERSION 1.8
app.js
Part 1A/Part 1

Core Data Engine
*/

"use strict";


/*
==============================
STORAGE KEYS
==============================
*/

const STORAGE = {

    settings: "payday_v18_settings",
    bills: "payday_v18_bills"

};


/*
==============================
DEFAULT SETTINGS
==============================
*/

let settings = {

    payFrequency: "Bi-Weekly",

    nextPayDate: "2026-07-10",

    paycheckAmount: 2184,

    savingsMinimum: 100,

    leftoverTarget: 150,

    displayMode: "standard"

};


/*
==============================
BILLS DATABASE
==============================
*/

let bills = [];


/*
==============================
ID GENERATOR
==============================
*/

function generateID(){

    return Date.now() + Math.floor(Math.random()*1000);

}


/*
==============================
CREATE BILL OBJECT
==============================
*/

function createBill(data){

    return {

        id: generateID(),

        name: data.name || "",

        amount: Number(data.amount) || 0,

        category: data.category || "Other",

        priority: Number(data.priority) || 1,


        dueDay: Number(data.dueDay) || 1,


        recurrence: data.recurrence || "Monthly",


        nextOccurrence:
        data.nextOccurrence || "",


        assignment:
        data.assignment || "Auto",


        assignedPaycheck:
        data.assignedPaycheck || "",


        status:
        data.status || "Upcoming"

    };

}


/*
==============================
SAVE FUNCTIONS
==============================
*/

function saveSettings(){

    localStorage.setItem(
        STORAGE.settings,
        JSON.stringify(settings)
    );

}



function saveBills(){

    localStorage.setItem(
        STORAGE.bills,
        JSON.stringify(bills)
    );

}


/*
==============================
LOAD FUNCTIONS
==============================
*/

function loadSettings(){

    let saved =
    localStorage.getItem(STORAGE.settings);


    if(saved){

        settings =
        {
            ...settings,
            ...JSON.parse(saved)
        };

    }

}



function loadBills(){

    let saved =
    localStorage.getItem(STORAGE.bills);


    if(saved){

        bills =
        JSON.parse(saved);

    }

}


/*
==============================
CLEAR DATA
==============================
*/

function clearAllData(){

    localStorage.removeItem(
        STORAGE.settings
    );


    localStorage.removeItem(
        STORAGE.bills
    );


    settings = {

        payFrequency:"Bi-Weekly",

        nextPayDate:"2026-07-10",

        paycheckAmount:2184,

        savingsMinimum:100,

        leftoverTarget:150,

        displayMode:"standard"

    };


    bills=[];


    saveSettings();

    saveBills();

}



/*
==============================
SAMPLE BUDGET
==============================
*/

function loadSampleBudget(){


    bills = [

        createBill({

            name:"Rent",

            amount:1150,

            category:"Housing",

            priority:1,

            dueDay:1,

            recurrence:"Monthly"

        }),


        createBill({

            name:"Student Loan 1",

            amount:100,

            category:"Loan",

            priority:1,

            dueDay:5,

            recurrence:"Monthly"

        }),


        createBill({

            name:"Spotify",

            amount:12,

            category:"Subscription",

            priority:3,

            dueDay:12,

            recurrence:"Monthly"

        }),


        createBill({

            name:"Electric",

            amount:75,

            category:"Utility",

            priority:1,

            dueDay:16,

            recurrence:"Monthly"

        }),


        createBill({

            name:"Student Loan 2",

            amount:238,

            category:"Loan",

            priority:1,

            dueDay:18,

            recurrence:"Monthly"

        }),


        createBill({

            name:"JCPenney Card",

            amount:50,

            category:"Debt",

            priority:2,

            dueDay:18,

            recurrence:"Monthly"

        }),


        createBill({

            name:"Credit Card",

            amount:300,

            category:"Debt",

            priority:2,

            dueDay:22,

            recurrence:"Monthly"

        }),


        createBill({

            name:"Personal Loan",

            amount:444,

            category:"Debt",

            priority:2,

            dueDay:28,

            recurrence:"Monthly"

        }),


        createBill({

            name:"Mom",

            amount:200,

            category:"Family",

            priority:1,

            dueDay:1,

            recurrence:"Monthly"

        })

    ];


    saveBills();

}
/*
PAYDAY VERSION 1.8
app.js
Part 1B/Part 1

Core Calculation Engine
*/


/*
==============================
DATE HELPERS
==============================
*/


function parseDate(date){

    return new Date(
        date + "T00:00:00"
    );

}



function formatDate(date){

    return date
        .toLocaleDateString(
            "en-US",
            {
                month:"2-digit",
                day:"2-digit",
                year:"numeric"
            }
        );

}



function addDays(date,days){

    let result =
    new Date(date);

    result.setDate(
        result.getDate()+days
    );

    return result;

}



function addMonths(date,months){

    let result =
    new Date(date);

    result.setMonth(
        result.getMonth()+months
    );

    return result;

}


/*
==============================
PAY FREQUENCY HELPERS
==============================
*/


function getFrequencyDays(){


    if(settings.payFrequency==="Weekly"){

        return 7;

    }


    if(settings.payFrequency==="Bi-Weekly"){

        return 14;

    }


    return 30;


}



/*
==============================
GENERATE FUTURE PAYCHECKS
==============================
*/


function generatePaychecks(count=12){


    let results=[];


    let current =
    parseDate(
        settings.nextPayDate
    );


    let days =
    getFrequencyDays();



    for(let i=0;i<count;i++){


        let start =
        new Date(current);



        let end =
        addDays(
            start,
            days-1
        );



        results.push({

            id:i+1,

            payDate:
            start,

            periodStart:
            start,

            periodEnd:
            end,


            income:
            settings.paycheckAmount


        });



        current =
        addDays(
            current,
            days
        );


    }


    return results;


}



/*
==============================
BILL OCCURRENCE HELPERS
==============================
*/


function getNextOccurrence(bill){


    let today =
    new Date();



    if(
        bill.recurrence==="One-Time"
    ){

        return bill.nextOccurrence;

    }



    let next =
    new Date(
        today
    );



    if(
        bill.recurrence==="Weekly"
    ){

        next.setDate(
            next.getDate()+7
        );

    }



    if(
        bill.recurrence==="Bi-Weekly"
    ){

        next.setDate(
            next.getDate()+14
        );

    }



    if(
        bill.recurrence==="Monthly"
    ){

        next.setMonth(
            next.getMonth()+1
        );

    }



    return next
        .toISOString()
        .split("T")[0];


}



/*
==============================
ASSIGN BILLS TO PAYCHECK
==============================
*/


function getBillsForPaycheck(paycheck){


    return bills.filter(
        bill=>{


            if(
                bill.assignment==="Manual"
            ){

                return (
                    bill.assignedPaycheck
                    ===
                    paycheck.id
                );

            }



            let due =
            Number(
                bill.dueDay
            );



            let start =
            paycheck.periodStart;



            let end =
            paycheck.periodEnd;



            let dueDate =
            new Date(
                start.getFullYear(),
                start.getMonth(),
                due
            );



            return (
                dueDate >= start &&
                dueDate <= end
            );


        }
    );


}



/*
==============================
PRIORITY GROUPING
==============================
*/


function groupBillsByPriority(list){


    return {

        priority1:

        list.filter(
            b=>b.priority===1
        ),


        priority2:

        list.filter(
            b=>b.priority===2
        ),


        priority3:

        list.filter(
            b=>b.priority===3
        )


    };


}



/*
==============================
SUM BILL GROUP
==============================
*/


function totalBills(list){


    return list.reduce(
        (total,bill)=>
        total+Number(bill.amount),
        0
    );


}



/*
==============================
PAYCHECK WATERFALL
==============================
*/


function calculatePaycheck(paycheck){


    let assigned =
    getBillsForPaycheck(
        paycheck
    );



    let groups =
    groupBillsByPriority(
        assigned
    );



    let starting =
    paycheck.income;



    let priority1 =
    totalBills(
        groups.priority1
    );



    let afterPriority1 =
    starting -
    priority1;



    let priority2 =
    totalBills(
        groups.priority2
    );



    let afterPriority2 =
    afterPriority1 -
    priority2;



    let priority3 =
    totalBills(
        groups.priority3
    );



    let afterPriority3 =
    afterPriority2 -
    priority3;



    let afterSavings =
    afterPriority3 -
    settings.savingsMinimum;



    let finalAvailable =
    afterSavings -
    settings.leftoverTarget;



    return {


        paycheck,


        bills:assigned,


        priority1,


        priority2,


        priority3,


        starting,


        afterPriority1,


        afterPriority2,


        afterPriority3,


        afterSavings,


        finalAvailable


    };


}



/*
==============================
FORECAST STATUS
==============================
*/


function getForecastStatus(result){


    if(
        result.finalAvailable < 0
    ){

        return {

            status:"Shortfall",

            color:"red"

        };

    }



    if(
        result.finalAvailable <
        100
    ){

        return {

            status:"Tight",

            color:"yellow"

        };

    }



    return {

        status:"Healthy",

        color:"green"

    };


}



/*
==============================
INITIAL LOAD
==============================
*/


loadSettings();

loadBills();
/*
PAYDAY VERSION 1.8
app.js
Part 2/3

UI Pages
*/


/*
==============================
APP NAVIGATION
==============================
*/


function loadPage(page){


    const app =
    document.getElementById("app");


    if(!app){

        return;

    }



    if(page==="dashboard"){

        renderDashboard();

    }


    if(page==="bills"){

        renderBills();

    }


    if(page==="paycheck"){

        renderPaycheck();

    }


    if(page==="monthly"){

        renderMonthly();

    }


    if(page==="settings"){

        renderSettings();

    }


}



/*
==============================
DASHBOARD
==============================
*/


function renderDashboard(){


    const app =
    document.getElementById("app");



    let paychecks =
    generatePaychecks(1);



    let result =
    calculatePaycheck(
        paychecks[0]
    );



    let status =
    getForecastStatus(
        result
    );



    app.innerHTML = `

<div class="panel">

<h2>
PayDay Control Center
</h2>


<div class="status ${status.color}">

${status.status}

</div>


</div>



<div class="panel">

<h3>
Current Paycheck
</h3>


<p>
Pay Date:
<b>
${formatDate(paychecks[0].payDate)}
</b>
</p>


<p>
Income:
<b>
$${settings.paycheckAmount}
</b>
</p>


<p>
Assigned Bills:
<b>
$${(
result.priority1+
result.priority2+
result.priority3
)}
</b>
</p>


<p>
Savings Target:
<b>
$${settings.savingsMinimum}
</b>
</p>


<p>
Protected Cash:
<b>
$${settings.leftoverTarget}
</b>
</p>


<h3>

Available:

$${result.finalAvailable}

</h3>


</div>



<div class="panel">

<h3>
Debt Snapshot
</h3>


<p>
Credit Card:
$16,250
</p>


<p>
Personal Loans:
$17,000
</p>


<p>
Student Loans:
$30,000
</p>


</div>


`;

}



/*
==============================
BILLS PAGE
==============================
*/


function renderBills(){


const app =
document.getElementById("app");



let html="";



bills.forEach((bill,index)=>{


html += `

<div class="panel">


<h3>
${bill.name}
</h3>


<p>
Amount:
$${bill.amount}
</p>


<p>
Category:
${bill.category}
</p>


<p>
Priority:
${bill.priority}
</p>


<p>
Recurring:
${bill.recurrence}
</p>


<p>
Next Occurrence:
${bill.nextOccurrence || "Not Set"}
</p>


<p>
Assignment:
${bill.assignment}
</p>


<p>
Status:
${bill.status}
</p>


<button onclick="editBill(${index})">

Edit

</button>


<button onclick="deleteBill(${index})">

Delete

</button>


</div>

`;


});



app.innerHTML = `

<h2>
Bills
</h2>


${html}


<div class="panel">

<h3>
Add Bill
</h3>


<input id="billName"
placeholder="Name">


<input id="billAmount"
placeholder="Amount">


<input id="billDue"
placeholder="Due Day">


<select id="billCategory">

<option>
Housing
</option>

<option>
Loan
</option>

<option>
Debt
</option>

<option>
Utility
</option>

<option>
Subscription
</option>

<option>
Other
</option>

</select>



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



<button onclick="addBill()">

Add Bill

</button>


</div>


`;

}



/*
==============================
ADD BILL
==============================
*/


function addBill(){


let bill =
createBill({

name:
document.getElementById("billName").value,


amount:
Number(
document.getElementById("billAmount").value
),


dueDay:
Number(
document.getElementById("billDue").value
),


category:
document.getElementById("billCategory").value,


recurrence:
document.getElementById("billRecurrence").value,


priority:
Number(
document.getElementById("billPriority").value
)


});



bills.push(bill);


saveBills();


renderBills();


}



/*
==============================
DELETE BILL
==============================
*/


function deleteBill(index){


bills.splice(
index,
1
);


saveBills();


renderBills();


}



/*
==============================
EDIT BILL
==============================
*/


function editBill(index){


let bill =
bills[index];



let amount =
prompt(
"Amount",
bill.amount
);



if(amount!==null){


bill.amount =
Number(amount);



}


let status =
prompt(
"Status",
bill.status
);



if(status!==null){


bill.status =
status;


}



saveBills();


renderBills();


}



/*
==============================
SET DISPLAY MODE
==============================
*/


function setDisplayMode(mode){


settings.displayMode =
mode;


saveSettings();


loadPage("dashboard");


}
/*
PAYDAY VERSION 1.8
app.js
Part 3/3

Final Pages + Startup
*/


/*
==============================
SELECTED PAYCHECK
==============================
*/


let selectedPaycheck = 0;



/*
==============================
PAYCHECK PAGE
==============================
*/


function renderPaycheck(){


const app =
document.getElementById("app");



let paychecks =
generatePaychecks(12);



let paycheck =
paychecks[selectedPaycheck];



let result =
calculatePaycheck(
paycheck
);



let status =
getForecastStatus(
result
);



app.innerHTML = `


<div class="panel">


<h2>
Paycheck Planner
</h2>



<button onclick="previousPaycheck()">

◀ Previous

</button>



<button onclick="nextPaycheck()">

Next ▶

</button>



<h3>

${formatDate(paycheck.payDate)}

</h3>



<div class="status ${status.color}">

${status.status}

</div>


</div>



<div class="panel">


<h3>
Starting Balance
</h3>


$${result.starting}



<h3>
Priority 1 - Required
</h3>

$${result.priority1}



<p>
Remaining:

$${result.afterPriority1}

</p>



<h3>
Priority 2 - Debt
</h3>

$${result.priority2}



<p>
Remaining:

$${result.afterPriority2}

</p>



<h3>
Priority 3 - Goals
</h3>

$${result.priority3}



<p>
Remaining:

$${result.afterPriority3}

</p>



<h3>
Savings

</h3>

$${settings.savingsMinimum}



<h3>
Protected Cash

</h3>

$${settings.leftoverTarget}



<h2>

Final Available

$${result.finalAvailable}

</h2>


</div>


`;

}



/*
==============================
PAYCHECK NAVIGATION
==============================
*/


function nextPaycheck(){


selectedPaycheck++;


if(selectedPaycheck>11){

selectedPaycheck=11;

}


renderPaycheck();


}



function previousPaycheck(){


selectedPaycheck--;


if(selectedPaycheck<0){

selectedPaycheck=0;

}


renderPaycheck();


}



/*
==============================
MONTHLY BUDGET
==============================
*/


let selectedMonth =
new Date();



function renderMonthly(){


const app =
document.getElementById("app");



let month =
selectedMonth
.toLocaleDateString(
"en-US",
{
month:"long",
year:"numeric"
}
);



let total =
bills.reduce(
(sum,bill)=>
sum+bill.amount,
0
);



app.innerHTML = `


<div class="panel">


<h2>
Monthly Budget

</h2>



<button onclick="previousMonth()">

◀

</button>


<b>
${month}
</b>


<button onclick="nextMonth()">

▶

</button>


</div>



<div class="panel">


<h3>
Monthly Income

</h3>

$${settings.paycheckAmount * 2}



<h3>
Monthly Bills

</h3>

$${total}



<h3>
Remaining

</h3>


$${

(settings.paycheckAmount*2)-total

}



</div>



<div class="panel">


<h3>
Calendar

</h3>


${renderCalendar()}


</div>


`;

}



/*
==============================
MONTH NAVIGATION
==============================
*/


function nextMonth(){

selectedMonth =
addMonths(
selectedMonth,
1
);


renderMonthly();


}



function previousMonth(){

selectedMonth =
addMonths(
selectedMonth,
-1
);


renderMonthly();


}



/*
==============================
CALENDAR
==============================
*/


function renderCalendar(){


let html="";



bills.forEach(bill=>{


html += `

<p>

<b>
${bill.dueDay}
</b>

-
${bill.name}

-

$${bill.amount}

</p>

`;

});


return html;


}



/*
==============================
SETTINGS PAGE
==============================
*/


function renderSettings(){


const app =
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
value="${settings.paycheckAmount}"
>



<label>
Next Pay Date
</label>


<input 
id="nextPay"
type="date"
value="${settings.nextPayDate}"
>




<label>
Savings Minimum
</label>


<input
id="saveMinimum"
value="${settings.savingsMinimum}"
>




<label>
Protected Cash
</label>


<input
id="leftover"
value="${settings.leftoverTarget}"
>




<button onclick="saveUserSettings()">

Save

</button>


</div>



<div class="panel">


<h3>
Testing Tools
</h3>



<button onclick="loadSampleBudget()">

Load Sample Budget

</button>



<button onclick="clearAllData()">

Clear All Data

</button>


</div>



`;

}



/*
==============================
SAVE SETTINGS FROM PAGE
==============================
*/


function saveUserSettings(){


settings.paycheckAmount =
Number(
document.getElementById("payAmount").value
);



settings.nextPayDate =
document.getElementById("nextPay").value;



settings.savingsMinimum =
Number(
document.getElementById("saveMinimum").value
);



settings.leftoverTarget =
Number(
document.getElementById("leftover").value
);



saveSettings();



renderSettings();


}



/*
==============================
START APP
==============================
*/


function startPayDay(){


loadSettings();


loadBills();



if(!document.getElementById("app")){

return;

}



if(
bills.length===0
){


document.getElementById("app").innerHTML = `


<div class="panel">

<h2>
Welcome to PayDay

</h2>


<p>
No budget data found.
</p>



<button onclick="loadSampleBudget();loadPage('dashboard')">

Load Sample Budget

</button>


<button onclick="loadPage('settings')">

Start My Budget

</button>


</div>


`;

return;

}



loadPage("dashboard");


}



startPayDay();