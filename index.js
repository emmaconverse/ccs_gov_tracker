var apiKey = 'qz2bKnuEq9ClhjzjdDzVFZzmxJ9NXyQeSgJZ0WXI';

//when page is loaded, the functions run automatically
$(document).ready(function() {
  fetchCommittees($('.congress-number').val());
  fetchRecentBills($('.congress-number').val());
});

//when the congress number changes, empty what was there, and re-fetch recent bills for that congress number
$('.congress-number').change(function() {
  $('.committees-container').empty();
  $('.bills-container').empty();
  fetchCommittees($(this).val());
  fetchRecentBills($(this).val());
});

// ON CLICK
$(document).on('click', '.committee-name-link', function(e) {
  //E.PREVENTdEFAULT prevents the browser from going to top of page every time something is clicked
  e.preventDefault();
  var idForLookup = $(this).attr('data-id');
  //syntax for looking up a data attr
  //selecting only committee, not all the links
  $('.committee.active').removeClass('active');
  $(`.committee[data-id='${idForLookup}']`).addClass('active');
  // $('.committees-container').toggle('active');
});


// SEARCH
$('.text-input').keyup(_.throttle(searchBills, 100, { leading: false }));

function searchBills() {
  var query = $(this).val();
  // console.log('query: ' + query);
  superagent
    .get(`https://api.propublica.org/congress/v1/bills/search.json?query=${query}`)
    .set("X-API-Key", apiKey)
    .then(function(response) {
      if (response.body.results) {
        $('.bills-container').empty();
        renderBills(response.body.results[0].bills);
      }
    });
};

// RECENT BILLS
function fetchRecentBills(congressNumber) {
  superagent
    .get(
      `https://api.propublica.org/congress/v1/${congressNumber}/house/bills/introduced.json`
    )
    .set("X-API-Key", apiKey)
    .then(function(response) {
      renderBills(response.body.results[0].bills);
      // console.log(response);
    });
}

function renderBills(bills) {
  bills.forEach(function(bill) {
    var committeeName = bill.committees;
    $(".bills-container").append(`
      <div class="bill">
        <h2>${bill.title}</h2>
        <h4>Sponsored by
        ${bill.sponsor_title}
        ${bill.sponsor_name}
        (${bill.sponsor_party} - ${bill.sponsor_state})</h4>
        <h4><a href="${bill.congressdotgov_url}">More Info...</a></h4>
        <h4 class="committee-name">Committee: <a class="committee-name-link" data-id="${bill.committee_codes}" href="#">${bill.committees}</a></h4>
      </div>
    `);
  });
}

//NEEDS A BIT MORE FOR THIS TO WORK IF THERE ARE MORE THAN ONE DATA ID
// committee: ${renderCommitteeLinks(bill.committee_codes)}

// function renderCommitteeLinks(comittee_codes) {
//   committee_codes.map(committee_code) {
//     return (`<a class="committee-name-link" data-id="${bill.committee_codes}" href="#">${bill.committees}</a>`)
//   }
// }

// COMMITTEES
//superagent is a tool kit for fetching remote data. getting the api url, setting the header (api key), then running functions.
function fetchCommittees(congressNumber) {
  superagent
    .get(`https://api.propublica.org/congress/v1/${congressNumber}/house/committees.json`)
    .set('X-API-Key', apiKey)
    .then(function(response) {
      renderCommittees(response.body.results[0].committees);
      // console.log(response)
      //foreaching over the results of fetchcommittees to find committee members
      // response.body.results[0].committees.forEach(function(committee) {
      // fetchCommitteeMembers(congressNumber, committee.id)
      // })
    })
};

function renderCommittees(committees) {
  // console.log(committees);
  committees.forEach(function(committee) {
    $('.committees-container').append(`
      <div class="committee" data-id="${committee.id}">
        <h2>${committee.name}</h2>
        <h3>Sponsored by
        ${committee.chamber}
        ${committee.chair}
        (${committee.chair_party} - ${committee.chair_state})</h3>
        <p><a href="${committee.url}">Committee's Website</a></p>
        <h3>Subcommittees:</h3>
        <div class="subcommittees-list"> ${committee.subcommittees.map(function(subcommittees) { return subcommittees.name;}).join(", ")}
        </div>
      </div>
    `)});
};

//MEMBERS?

// function fetchCommitteeMembers(congressNumber, committeeId) {
//   superagent
//     .get(`https://api.propublica.org/congress/v1/${congressNumber}/house/committees/${committeeId}.json`)
//     .set('X-API-Key', apiKey)
//     .then(function(response) {
//       console.log(response)
//       renderCommitteeMembers(response.body.results[0].current_members);
//     })
// };


// function renderCommitteeMembers(current_members) {
//   //console.log(current_members);
//   current_members.forEach(function(current_member) {
//    console.log(current_member.name);
//     $('.committee-members').append(`
//       <div>
//         <h5>${current_member.name}</h5>
//       </div>
//     `)
//   });
// }
