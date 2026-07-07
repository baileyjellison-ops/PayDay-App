const bills = [

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



function loadPage(page){


const app=document.getElementById("app");



if(page==="dashboard"){


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


<div class="panel">

<div class="card-label">
NEXT PAYCHECK
</div>

<div class="card-value yellow">
$${budget.paycheck}
</div>

</div>


</div>


<div class="panel">

<h2>
System Status
</h2>

<div class="status">
Budget engine online
</div>


<ul>

<li>Savings minimum maintained</li>

<li>Rent planning active</li>

<li>Debt tracking active</li>

</ul>


</div>

`;

}



if(page==="bills"){


let rows="";


bills.forEach(function(b){

rows += `

<tr>

<td>${b.name}</td>

<td>$${b.amount}</td>

<td>${b.due}</td>

<td>${b.type}</td>

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
Bill
</th>

<th>
Amount
</th>

<th>
Due
</th>

<th>
Type
</th>

</tr>


${rows}


</table>


</div>

`;

}



if(page==="paycheck"){


app.innerHTML=`

<div class="panel">

<h2>
Paycheck Allocation
</h2>


<table>

<tr>

<td>
Paycheck Amount
</td>

<td>
$2,184
</td>

</tr>


<tr>

<td>
Frequency
</td>

<td>
Bi-Weekly
</td>

</tr>


<tr>

<td>
Savings Goal
</td>

<td>
$100/check
</td>

</tr>


</table>


</div>

`;

}



if(page==="reports"){


app.innerHTML=`

<div class="panel">

<h2>
Financial Reports
</h2>


<p>
Debt Summary
</p>


<p>
Credit Card: $${budget.creditCard.toLocaleString()}</p>

<p>
Personal Loans: $${budget.personalLoans.toLocaleString()}</p>

<p>
Student Loans: $${budget.studentLoans.toLocaleString()}</p>


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
Changes here will not affect your real budget.
</p>


<p>
Example:
Extra Income +$500/month
</p>


</div>

`;

}



}



loadPage("dashboard");
