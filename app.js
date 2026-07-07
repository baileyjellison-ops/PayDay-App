let bills = JSON.parse(localStorage.getItem("paydayBills")) || [

{
name:"Rent",
amount:1150,
due:"1st",
type:"Fixed"
},

{
name:"Student Loan 1",
amount:100,
due:"5th",
type:"Fixed"
},

{
name:"Spotify",
amount:12,
due:"12th",
type:"Fixed"
},

{
name:"Electric",
amount:75,
due:"16th",
type:"Fixed"
},

{
name:"Student Loan 2",
amount:238,
due:"18th",
type:"Fixed"
},

{
name:"JCPenney Card",
amount:50,
due:"18th",
type:"Debt"
},

{
name:"Credit Card",
amount:300,
due:"22nd",
type:"Debt"
},

{
name:"Personal Loan",
amount:444,
due:"28th",
type:"Debt"
},

{
name:"Mom",
amount:200,
due:"Monthly",
type:"Fixed"
}

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


let totalBills = bills.reduce(
(sum,b)=>sum+b.amount,0
);


app.innerHTML=`

<div class="grid">


<div class="panel">

<div class="card-label">
MONTHLY INCOME
</div>

<div class="card-value green">
$${budget.income}
</div>

</div>


<div class="panel">

<div class="card-label">
MONTHLY BILLS
</div>

<div class="card-value yellow">
$${totalBills}
</div>

</div>


<div class="panel">

<div class="card-label">
TOTAL DEBT
</div>

<div class="card-value red">
$${(
budget.creditCard+
budget.personalLoans+
budget.studentLoans
).toLocaleString()}
</div>

</div>


</div>


<div class="panel">

<h2>
System Status
</h2>

<div class="status">
PayDay database online
</div>


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

<th>Name</th>

<th>Amount</th>

<th>Due</th>

<th>Type</th>

<th></th>

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
Frequency:
Bi-Weekly
</p>


<p>
Savings Goal:
$100/check
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
Monthly Bills:
$${bills.reduce((s,b)=>s+b.amount,0)}
</p>


<p>
Credit Card:
$${budget.creditCard.toLocaleString()}
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


<p>
Future income and debt scenarios go here.
</p>


</div>

`;

}


}



function addBill(){


let name=document.getElementById("billName").value;

let amount=Number(
document.getElementById("billAmount").value
);

let due=document.getElementById("billDue").value;


if(name && amount){


bills.push({

name:name,

amount:amount,

due:due,

type:"Custom"

});


saveBills();

loadPage("bills");


}


}



function deleteBill(index){


bills.splice(index,1);

saveBills();

loadPage("bills");


}



loadPage("dashboard");
