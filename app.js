// const { Chart } = require("chart.js");

const countries = document.querySelector(".countries");
const titles = document.querySelector(".titles");
const countriesSelect = document.querySelector(".countriesSelect");
const regionName = document.querySelector(".regionName");

const ctx = document.getElementById("myChart").getContext("2d");

statData = {
  regions: ["africa", "americas", "asia", "europe", "oceania"],
  allData: null,
  populationOfCountries: {},
  populationOfCites: {},
  AllApis: {
    byRegion: "https://restcountries.com/v3.1/region/",
    byCountry: "https://countriesnow.space/api/v0.1/countries/cities",
    byCity:
      "https://countriesnow.space/api/v0.1/countries/population/cities/filter",
  },
};

const fetchData = async function (url, kind, countryOrCity) {
  try {
    let res;
    if (kind === "POST") {
      if (url.includes("population")) {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          //     body: JSON.stringify({
          //       city: countryOrCity,
          //     }),
          //   });
          body: JSON.stringify({
            limit: 20,
            order: "asc",
            orderBy: "name",
            country: countryOrCity,
          }),
        });
      } else {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: countryOrCity,
          }),
        });
      }
    } else {
      res = await fetch(url);
    }

    const data = await res.json();
    return data;
  } catch {
    console.log("data not found");
  }
};

const promisAllData = async function () {
  const regionsData = statData.regions.map((region) => {
    return fetchData(statData.AllApis.byRegion + region);
  });
  const [africa, americas, asia, europe, oceania] = await Promise.all(
    regionsData
  );
  return { africa, americas, asia, europe, oceania };
};

const calcPopulationOfRegionAndCountries = async function () {
  let populationCount = 0;
  populationRegionObj = {};
  populationCountriesObj = {};
  for (let region of statData.regions) {
    dataOfCountries = [];
    for (let country of statData.allData[region]) {
      const name = country.name.common.toLowerCase();
      const population = country.population;
      populationCount += country.population;
      dataOfCountries.push({ name, population });
      populationCountriesObj[name] = population;

      // statData.populationOfCountries[region] = dataOfCountries;
      // statData.populationOfCountries[region].population = populationCount;
      populationRegionObj[region] = populationCount;
    }
    statData.populationOfCountries[region] = populationCountriesObj;
    populationCountriesObj = {};
  }
  // draw(populationRegionObj);

  data.datasets[0].data = populationRegionObj;
  myChart.update();
};

const getPopulationOfCitiesInSpisificCountry = async function (country) {
  const getCities = await fetchData(statData.AllApis.byCity, "POST", country);
  const cities = {};
  if (getCities.data) {
    for (let city of getCities.data) {
      const myCity = city.city;
      const population = city.populationCounts[0].value;
      cities[myCity] = population;
    }
  }
  return cities;
};

const startup = async function () {
  statData.allData = await promisAllData();
  // const searchCountry = await getPopulationOfCitiesInSpisificCountry("israel");
  calcPopulationOfRegionAndCountries();
};

const fillCountriesIntoSelectBox = function (region) {
  countriesSelect.replaceChildren();
  for (let country in statData.populationOfCountries[region]) {
    const optionDiv = document.createElement("option");
    optionDiv.classList.add("optionDiv");
    optionDiv.setAttribute("id", country);
    optionDiv.setAttribute("value", country);
    optionDiv.textContent = country;
    countriesSelect.appendChild(optionDiv);
  }
  regionName.textContent = region;
};

const showCities = async function (e) {
  const countryName = e.target.selectedOptions[0].value;
  const cities = await getPopulationOfCitiesInSpisificCountry(countryName);
  console.log(cities);
  data.datasets[0].data = cities;
  myChart.update();
};
const showCountries = function (e) {
  const nameOfRegion = e.target.id;
  // myChart.destroy();
  // console.log(statData.populationCountriesObj[nameOfRegion]);
  data.datasets[0].data = statData.populationOfCountries[nameOfRegion];
  myChart.update();
  fillCountriesIntoSelectBox(nameOfRegion);
};

const events = function () {
  titles.addEventListener("click", showCountries);
  countriesSelect.addEventListener("change", showCities);
};
startup();
events();

console.log(statData.populationRegionObj);
const data = {
  datasets: [
    {
      label: "World Population",
      data: "",
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const config = {
  type: "bar",
  data,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};
let myChart = new Chart(document.getElementById("myChart"), config);

// getPopulationOfCitiesInSpisificCountry("france");
