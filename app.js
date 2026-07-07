/*
==================================================
PayDay Version 1.8.1
app.js
Part 1A / 2

Core Engine
Data + Storage
==================================================
*/


"use strict";


/*
==================================================
GLOBAL APP STATE
==================================================
*/

const PayDay = {


    settings: {

        payFrequency: "Bi-Weekly",

        paycheckAmount: 2184,

        nextPayDate: "2026-07-10",

        savingsMinimum: 100,

        leftoverTarget: 150,

        displayMode: "standard"

    },


    bills: [],


    scenarioBills: [],


    selectedPaycheck: 0,


    selectedMonth: new Date()


};



/*
==================================================
STORAGE KEYS
==================================================
*/

const STORAGE_KEYS = {


    settings:
    "payday_settings",


    bills:
    "payday_bills",


    scenario:
    "payday_scenario"



};



/*
==================================================
ID GENERATOR
==================================================
*/


function generateID(){


    return Date.now() +
    Math.floor(Math.random()*1000);


}



/*
==================================================
BILL OBJECT CREATOR
==================================================
*/


function createBill(data){


    return {


        id:
        data.id || generateID(),


        name:
        data.name || "New Bill",


        amount:
        Number(data.amount) || 0,


        category:
        data.category || "Other",


        priority:
        Number(data.priority) || 1,


        dueDay:
        Number(data.dueDay) || 1,


        recurrence:
        data.recurrence || "Monthly",


        nextOccurrence:
        data.nextOccurrence || "",


        assignment:
        data.assignment || "Auto",


        assignedPaycheck:
        data.assignedPaycheck || null,


        status:
        data.status || "Upcoming"


    };


}



/*
==================================================
SAVE DATA
==================================================
*/


function saveSettings(){


    localStorage.setItem(

        STORAGE_KEYS.settings,

        JSON.stringify(
            PayDay.settings
        )

    );


}



function saveBills(){


    localStorage.setItem(

        STORAGE_KEYS.bills,

        JSON.stringify(
            PayDay.bills
        )

    );


}



function saveScenario(){


    localStorage.setItem(

        STORAGE_KEYS.scenario,

        JSON.stringify(
            PayDay.scenarioBills
        )

    );


}



/*
==================================================
LOAD DATA
==================================================
*/


function loadSettings(){


    const data =
    localStorage.getItem(
        STORAGE_KEYS.settings
    );



    if(data){


        PayDay.settings = {

            ...PayDay.settings,

            ...JSON.parse(data)

        };


    }


}




function loadBills(){


    const data =
    localStorage.getItem(
        STORAGE_KEYS.bills
    );



    if(data){


        PayDay.bills =
        JSON.parse(data);


    }


}




function loadScenario(){


    const data =
    localStorage.getItem(
        STORAGE_KEYS.scenario
    );



    if(data){


        PayDay.scenarioBills =
        JSON.parse(data);


    }


}



/*
==================================================
CLEAR DATA
==================================================
*/


function clearAllData(){


    localStorage.removeItem(
        STORAGE_KEYS.settings
    );


    localStorage.removeItem(
        STORAGE_KEYS.bills
    );


    localStorage.removeItem(
        STORAGE_KEYS.scenario
    );



    location.reload();


}



/*
==================================================
SAMPLE BUDGET LOADER
==================================================
*/


function loadSampleBudget(){



PayDay.bills = [


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



alert(
"Sample Budget Loaded"
);



}



/*
==================================================
ADD / UPDATE / REMOVE BILLS
==================================================
*/


function addBill(billData){


PayDay.bills.push(

createBill(billData)

);


saveBills();


}




function deleteBill(id){


PayDay.bills =

PayDay.bills.filter(

bill =>
bill.id !== id

);



saveBills();


}




function updateBill(id,changes){


let bill =

PayDay.bills.find(

b=>b.id===id

);



if(!bill)
return;



Object.assign(

bill,

changes

);



saveBills();


}



/*
==================================================
INITIAL LOAD
==================================================
*/


function initializeData(){


loadSettings();


loadBills();


loadScenario();


}



initializeData();
/*
==================================================
PayDay Version 1.8.1
app.js
Part 1B / 2

Paycheck Engine + Forecast Calculations
==================================================
*/


/*
==================================================
DATE HELPERS
==================================================
*/


function toDate(value){


    if(value instanceof Date){

        return value;

    }


    return new Date(
        value + "T00:00:00"
    );


}



function formatDate(date){


    return date.toLocaleDateString(
        "en-US",
        {
            month:"2-digit",
            day:"2-digit",
            year:"numeric"
        }
    );


}



function addDays(date,amount){


    let result =
    new Date(date);


    result.setDate(
        result.getDate()+amount
    );


    return result;


}



function addMonths(date,amount){


    let result =
    new Date(date);


    result.setMonth(
        result.getMonth()+amount
    );


    return result;


}



/*
==================================================
PAY FREQUENCY
==================================================
*/


function getPayPeriodDays(){


    switch(
        PayDay.settings.payFrequency
    ){


        case "Weekly":

            return 7;



        case "Bi-Weekly":

            return 14;



        case "Monthly":

            return 30;



        default:

            return 14;


    }


}



/*
==================================================
GENERATE FUTURE PAYCHECKS
==================================================
*/


function generatePaychecks(numberOfChecks = 12){


    let checks = [];


    let currentDate =
    toDate(
        PayDay.settings.nextPayDate
    );


    let days =
    getPayPeriodDays();



    for(
        let i = 0;
        i < numberOfChecks;
        i++
    ){


        let periodStart =
        new Date(currentDate);



        let periodEnd =
        addDays(
            periodStart,
            days - 1
        );



        checks.push({


            id:i,


            payDate:
            new Date(currentDate),


            periodStart,


            periodEnd,


            income:
            PayDay.settings.paycheckAmount



        });



        currentDate =
        addDays(
            currentDate,
            days
        );


    }


    return checks;


}



/*
==================================================
CHECK IF BILL FALLS IN PAY PERIOD
==================================================
*/


function billFallsInPeriod(
    bill,
    paycheck
){


    /*
    Manual assignment override
    */


    if(
        bill.assignment === "Manual"
    ){


        return (
            bill.assignedPaycheck ===
            paycheck.id
        );


    }



    /*
    Recurring bills
    */


    let dueDate =
    new Date(

        paycheck.periodStart.getFullYear(),

        paycheck.periodStart.getMonth(),

        bill.dueDay

    );



    return (

        dueDate >= paycheck.periodStart &&

        dueDate <= paycheck.periodEnd

    );


}



/*
==================================================
GET BILLS FOR PAYCHECK
==================================================
*/


function getBillsForPaycheck(
    paycheck,
    billList = PayDay.bills
){


    return billList.filter(

        bill =>

        billFallsInPeriod(
            bill,
            paycheck
        )

    );


}



/*
==================================================
BILL TOTALS
==================================================
*/


function calculateBillTotal(
    billArray
){


    return billArray.reduce(

        (total,bill)=>

        total + Number(bill.amount),

        0

    );


}



/*
==================================================
GROUP BY PRIORITY
==================================================
*/


function splitBillsByPriority(
    billArray
){


    return {


        priority1:

        billArray.filter(

            bill =>

            bill.priority === 1

        ),



        priority2:

        billArray.filter(

            bill =>

            bill.priority === 2

        ),



        priority3:

        billArray.filter(

            bill =>

            bill.priority === 3

        )


    };


}



/*
==================================================
PAYCHECK WATERFALL CALCULATION
==================================================
*/


function calculatePaycheck(
    paycheck,
    billList = PayDay.bills
){


    let paycheckBills =

    getBillsForPaycheck(

        paycheck,

        billList

    );



    let groups =

    splitBillsByPriority(

        paycheckBills

    );



    let startingBalance =

    paycheck.income;



    let priority1Total =

    calculateBillTotal(

        groups.priority1

    );



    let afterPriority1 =

    startingBalance -

    priority1Total;



    let priority2Total =

    calculateBillTotal(

        groups.priority2

    );



    let afterPriority2 =

    afterPriority1 -

    priority2Total;



    let priority3Total =

    calculateBillTotal(

        groups.priority3

    );



    let afterPriority3 =

    afterPriority2 -

    priority3Total;



    let savings =

    PayDay.settings.savingsMinimum;



    let afterSavings =

    afterPriority3 -

    savings;



    let protectedCash =

    PayDay.settings.leftoverTarget;



    let finalAvailable =

    afterSavings -

    protectedCash;



    return {


        paycheck,


        bills:paycheckBills,


        startingBalance,


        priority1Total,


        priority2Total,


        priority3Total,


        afterPriority1,


        afterPriority2,


        afterPriority3,


        savings,


        protectedCash,


        finalAvailable



    };


}



/*
==================================================
FORECAST STATUS
==================================================
*/


function getForecastStatus(
    paycheckResult
){


    if(
        paycheckResult.finalAvailable < 0
    ){


        return {


            text:"Shortfall",

            className:"red"


        };


    }



    if(
        paycheckResult.finalAvailable < 100
    ){


        return {


            text:"Tight",

            className:"yellow"


        };


    }



    return {


        text:"Healthy",

        className:"green"


    };


}



/*
==================================================
MONTHLY TOTALS
==================================================
*/


function calculateMonthlyIncome(){


    return (

        PayDay.settings.paycheckAmount *

        (
            PayDay.settings.payFrequency === "Weekly"
            ? 4
            : 2
        )

    );


}



function calculateMonthlyBills(){


    return calculateBillTotal(

        PayDay.bills

    );


}



function calculateMonthlyRemaining(){


    return (

        calculateMonthlyIncome()

        -

        calculateMonthlyBills()

    );


}
/*
==================================================
PayDay Version 1.8.1
app.js
Part 2 / 2

UI Engine
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


        case "reports":

            renderReports();

            break;


        case "scenario":

            renderScenario();

            break;


        case "settings":

            renderSettings();

            break;


        case "monthly":

            renderMonthly();

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
PayDay Control Center
</h2>


<div class="status ${status.className}">

${status.text}

</div>


</div>



<div class="grid">


<div class="panel">

<div class="card-label">

Paycheck

</div>


<div class="card-value">

$${paycheck.income}

</div>

</div>



<div class="panel">

<div class="card-label">

Bills

</div>


<div class="card-value">

$${calculateBillTotal(result.bills)}

</div>

</div>



<div class="panel">

<div class="card-label">

Available

</div>


<div class="card-value">

$${result.finalAvailable}

</div>

</div>



</div>



<div class="panel">


<h3>
Priority Breakdown
</h3>


<p>
Priority 1:
$${result.priority1Total}
</p>


<p>
Remaining:
$${result.afterPriority1}
</p>



<p>
Priority 2:
$${result.priority2Total}
</p>


<p>
Remaining:
$${result.afterPriority2}
</p>



<p>
Priority 3:
$${result.priority3Total}
</p>


<p>
Remaining:
$${result.afterPriority3}
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


let rows="";


PayDay.bills.forEach(bill=>{


rows += `

<tr>

<td>${bill.name}</td>

<td>$${bill.amount}</td>

<td>${bill.priority}</td>

<td>${bill.recurrence}</td>

<td>${bill.status}</td>

<td>

<button onclick="deleteBill(${bill.id})">

Delete

</button>

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

<th>Name</th>

<th>Amount</th>

<th>Priority</th>

<th>Frequency</th>

<th>Status</th>

<th></th>

</tr>


${rows}


</table>


</div>



<div class="panel">


<h3>
Add Bill
</h3>


<input id="billName"
placeholder="Name">


<input id="billAmount"
placeholder="Amount">


<input id="billDay"
placeholder="Due Day">



<button onclick="createBillFromForm()">

Add Bill

</button>


</div>

`;

}



function createBillFromForm(){


addBill({

name:
document.getElementById("billName").value,


amount:
Number(
document.getElementById("billAmount").value
),


dueDay:
Number(
document.getElementById("billDay").value
)


});


renderBills();


}



/*
==================================================
PAYCHECK PAGE
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

${formatDate(check.payDate)}

</h3>


</div>



<div class="panel">


<p>
Starting Balance:
$${result.startingBalance}
</p>


<p>
Priority 1:
$${result.priority1Total}
</p>


<p>
Remaining:
$${result.afterPriority1}
</p>


<p>
Priority 2:
$${result.priority2Total}
</p>


<p>
Remaining:
$${result.afterPriority2}
</p>


<p>
Priority 3:
$${result.priority3Total}
</p>


<p>
Final Available:
$${result.finalAvailable}
</p>


</div>


`;

}



function nextPaycheck(){


PayDay.selectedPaycheck++;


renderPaycheck();


}



function previousPaycheck(){


PayDay.selectedPaycheck--;


if(
PayDay.selectedPaycheck < 0
){

PayDay.selectedPaycheck=0;

}


renderPaycheck();


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
Monthly Income:
$${calculateMonthlyIncome()}
</p>


<p>
Monthly Bills:
$${calculateMonthlyBills()}
</p>


<p>
Remaining:
$${calculateMonthlyRemaining()}
</p>


</div>

`;

}



/*
==================================================
SCENARIO MODE
==================================================
*/


function renderScenario(){


document.getElementById("app").innerHTML = `


<div class="panel">


<h2>
Scenario Mode
</h2>


<p>
Test changes without affecting your real budget.
</p>


</div>


`;

}
/*
==================================================
PayDay Version 1.8.1
app.js
Part 3 / 3

Monthly Budget
Settings
Startup
==================================================
*/


/*
==================================================
MONTHLY BUDGET PAGE
==================================================
*/


function renderMonthly(){


let app =
document.getElementById("app");


let month =
PayDay.selectedMonth
.toLocaleDateString(
"en-US",
{
    month:"long",
    year:"numeric"
}
);



let income =
calculateMonthlyIncome();



let expenses =
calculateMonthlyBills();



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



<div class="grid">


<div class="panel">

<div class="card-label">

Income

</div>


<div class="card-value">

$${income}

</div>

</div>



<div class="panel">

<div class="card-label">

Bills

</div>


<div class="card-value">

$${expenses}

</div>

</div>



<div class="panel">

<div class="card-label">

Remaining

</div>


<div class="card-value">

$${income-expenses}

</div>

</div>



</div>



<div class="panel">


<h3>

Bill Calendar

</h3>


${renderCalendar()}


</div>

`;

}



function nextMonth(){


PayDay.selectedMonth =

addMonths(

PayDay.selectedMonth,

1

);


renderMonthly();


}



function previousMonth(){


PayDay.selectedMonth =

addMonths(

PayDay.selectedMonth,

-1

);


renderMonthly();


}



/*
==================================================
CALENDAR
==================================================
*/


function renderCalendar(){


let output = "";



PayDay.bills.forEach(
bill=>{


output += `

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


return output;


}



/*
==================================================
SETTINGS PAGE
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


<input id="settingPay"

value="${PayDay.settings.paycheckAmount}">


<br><br>


<label>
Next Pay Date
</label>


<input

type="date"

id="settingDate"

value="${PayDay.settings.nextPayDate}">


<br><br>


<label>
Pay Frequency
</label>


<select id="settingFrequency">


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


<br><br>


<label>
Savings Minimum
</label>


<input

id="settingSavings"

value="${PayDay.settings.savingsMinimum}">


<br><br>


<label>
Leftover Cash
</label>


<input

id="settingCash"

value="${PayDay.settings.leftoverTarget}">


<br><br>


<button onclick="saveSettingsForm()">

Save Settings

</button>


</div>



<div class="panel">


<h3>

Testing

</h3>


<button onclick="loadSampleBudget()">

Load Sample Budget

</button>


<button onclick="clearAllData()">

Clear Data

</button>


</div>


`;

}



/*
==================================================
SAVE SETTINGS FORM
==================================================
*/


function saveSettingsForm(){


PayDay.settings.paycheckAmount =

Number(

document.getElementById(
"settingPay"
).value

);



PayDay.settings.nextPayDate =

document.getElementById(
"settingDate"
).value;



PayDay.settings.payFrequency =

document.getElementById(
"settingFrequency"
).value;



PayDay.settings.savingsMinimum =

Number(

document.getElementById(
"settingSavings"
).value

);



PayDay.settings.leftoverTarget =

Number(

document.getElementById(
"settingCash"
).value

);



saveSettings();



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


saveSettings();



let body =
document.body;



if(mode==="graphic"){


body.classList.add(
"graphic"
);


}


else{


body.classList.remove(
"graphic"
);


}


}



/*
==================================================
START APPLICATION
==================================================
*/


function startPayDay(){


initializeData();



let app =
document.getElementById("app");



if(!app){

return;

}



if(
PayDay.bills.length===0
){


app.innerHTML = `


<div class="panel">


<h2>

Welcome To PayDay

</h2>


<p>

No budget data found.

</p>



<button onclick="loadSampleBudget();renderDashboard()">

Load Sample Budget

</button>



</div>

`;


return;


}



loadPage("dashboard");


}



startPayDay();