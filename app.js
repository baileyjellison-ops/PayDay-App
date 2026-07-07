let bills = JSON.parse(localStorage.getItem("paydayBills")) || [

{name:"Rent",amount:1150,due:"1st",type:"Housing",priority:1},
{name:"Student Loan 1",amount:100,due:"5th",type:"Loan",priority:1},
{name:"Spotify",amount:12,due:"12th",type:"Subscription",priority:3},
{name:"Electric",amount:75,due:"16th",type:"Utility",priority:1},
{name:"Student Loan 2",amount:238,due:"18th",type:"Loan",priority:1},
{name:"JCPenney Card",amount:50,due:"18th",type:"Debt",priority:2},
{name:"Credit Card",amount:300,due:"22nd",type:"Debt",priority:2},
{name:"Personal Loan",amount:444,due:"28th",type:"Debt",priority:2},
{name:"Mom",amount:200,due:"Monthly",type:"Family",priority:1}

];


const budget = {

income:4368,
paycheck:2184,
creditCard:16250,
personalLoans:17000,
studentLoans:30000

};



function saveBills(){

localStorage.setItem(
"paydayBills",
JSON.stringify(bills)
);

}



function loadPage(page){

const app=document.getElementById("app");



if(page==="dashboard"){


let priority1 = bills
.filter(b=>b.priority===1)
.reduce((s,b)=>s+b.amount,0);


let priority2 = bills
.filter(b=>b.priority===2)
.reduce((s,b)=>s+b.amount,0);


let priority3 = bills
.filter(b=>b.priority===3)
.reduce((s,b)=>s+b.amount,0);



app.innerHTML=`

<div class="grid">

<div class="panel">
<div class="card-label">
Priority 1 Required
</div>

<div class="card-value red">
$${priority1}
</div>

</div>


<div class="panel">
<div class="card-label">
Priority 2 Debt
</div>

<div class="card-value yellow">
$${priority2}
</div>

</div>


<div class="panel">
<div class="card-label">
Priority 3 Goals
</div>

<div class="card-value green">
$${priority3}
</div>

</div>


</div>


<div class="panel">

<h2>
System Status
</h2>

<div class="status">
Priority engine online
</div>

<p>
Rent reserve logic ready.
</p>

</div>

`;

}



if(page==="bills"){


let rows="";


bills.forEach((b,index)=>{


rows += `

<tr>

<td>${b.name}</td>

<td>$${b.amount}</td>

<td>${b.due}</td>

<td>${b.type}</td>

<td>
${b.priority}
</td>


<td>

<button onclick="deleteBill(${index})">
Delete
</button>

</td>


</tr>

`;

});



app.innerHTML=`

<div class="panel">

<h2>
Bill Control Panel
</h2>


<table>

<tr>

<th>
Name
</th>

<th>
Amount
</th>

<th>
Due
</th>

<th>
Category
</th>

<th>
Priority
</th>

<th>
</th>

</tr>


${rows}


</table>


<br>


<h3>
Add Bill
</h3>


<input id="billName" placeholder="Bill Name">

<input id="billAmount" placeholder="Amount">

<input id="billDue" placeholder="Due Date">


<select id="billType">

<option>
Housing
</option>

<option>
Debt
</option>

<option>
Loan
</option>

<option>
Utility
</option>

<option>
Subscription
</option>

<option>
Goal
</option>

</select>


<select id="billPriority">

<option value="1">
Priority 1 - Required
</option>

<option value="2">
Priority 2 - Debt
</option>

<option value="3">
Priority 3 - Goal
</option>


</select>


<button onclick="addBill()">
Add Bill
</button>


</div>

`;

}



if(page==="paycheck"){


app.innerHTML=`

<div class="panel">

<h2>
Paycheck Allocation
</h2>


<p>
Paycheck:
$2,184
</p>


<p>
Priority 1 bills are funded first.
</p>


<p>
Rent reserve enabled.
</p>


</div>

`;

}



if(page==="reports"){


app.innerHTML=`

<div class="panel">

<h2>
Reports
</h2>

<p>
Total Monthly Commitments:
$${bills.reduce((s,b)=>s+b.amount,0)}
</p>


</div>

`;

}



if(page==="scenario"){


app.innerHTML=`

<div class="panel">

<h2>
Scenario Mode
</h2>

<div class="status">
Simulation Only
</div>

</div>

`;

}


}



function addBill(){


let bill={

name:document.getElementById("billName").value,

amount:Number(document.getElementById("billAmount").value),

due:document.getElementById("billDue").value,

type:document.getElementById("billType").value,

priority:Number(document.getElementById("billPriority").value)

};



if(bill.name && bill.amount){

bills.push(bill);

saveBills();

loadPage("bills");

}


}



function deleteBill(index){

bills.splice(index,1);

saveBills();

loadPage("bills");

}



saveBills();

loadPage("dashboard");
