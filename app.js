// const { Chart } = require("chart.js");

const countries = document.querySelector(".countries");
const titles = document.querySelector(".titles");
const countriesSelect = document.querySelector(".countriesSelect");
const regionName = document.querySelector(".regionName");
const countryDetails = document.querySelector(".countryDetails");
const detailsFlag = document.querySelector(".details-flag");
const detailsName = document.querySelector(".details-name");
const detailsCapital = document.querySelector(".details-capital");
const detailsArea = document.querySelector(".details-area");
const detailsPopulation = document.querySelector(".details-population");
const detailsBorders = document.querySelector(".details-borders");

const ctx = document.getElementById("myChart").getContext("2d");

statData = {
  regions: ["africa", "americas", "asia", "europe", "oceania"],
  allData: null,
  dataOfCountries: [],
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

const detailsRegionAndCountries = async function () {
  let populationCount = 0;
  populationRegionObj = {};
  populationCountriesObj = {};
  for (let region of statData.regions) {
    for (let country of statData.allData[region]) {
      const name = country.name.common.toLowerCase();
      const capital = country.capital;
      const population = country.population;
      const flag = country.flags;
      const area = country.area;
      const borders = country.borders;
      populationCount += country.population;
      statData.dataOfCountries.push({
        name,
        capital,
        population,
        flag,
        area,
        borders,
      });
      populationCountriesObj[name] = population;
      populationRegionObj[region] = populationCount;
    }
    statData.populationOfCountries[region] = populationCountriesObj;
    populationCountriesObj = {};
  }
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
  detailsRegionAndCountries();
};

const fillCountriesIntoSelectBox = function (region) {
  countriesSelect.replaceChildren();
  const headOfSelectList = document.createElement("option");
  headOfSelectList.classList.add("optionDiv");
  headOfSelectList.setAttribute("disabled", true);
  headOfSelectList.setAttribute("selected", true);
  headOfSelectList.textContent = "Select Country";
  countriesSelect.appendChild(headOfSelectList);
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
const getDetailsOfCountry = function (countryName) {
  const details = statData.dataOfCountries.find((country) => {
    return country.name === countryName;
  });
  detailsFlag.src = details.flag["png"];
  detailsName.textContent = "Name:" + " " + details["name"];
  detailsCapital.textContent = "Capital:" + " " + details["capital"];
  detailsArea.textContent = "Area:" + " " + details["area"] / 1000 + " Km2";
  detailsPopulation.textContent =
    "Population:" + " " + details["population"] / 1000000 + "million";
  detailsBorders.textContent = "Borders :";
  details.borders.forEach((country) => {
    const borderDiv = document.createElement("div");
    borderDiv.textContent = country;
    detailsBorders.appendChild(borderDiv);
  });
};
const showCities = async function (e) {
  countryDetails.style.display = "flex";
  countries.style.justifyContent = "flex-start";
  const countryName = e.target.selectedOptions[0].value;
  const cities = await getPopulationOfCitiesInSpisificCountry(countryName);
  data.datasets[0].data = cities;
  myChart.update();
  getDetailsOfCountry(countryName);
};
const showCountries = function (e) {
  countries.style.display = "flex";
  countryDetails.style.display = "none";
  const nameOfRegion = e.target.id;
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

const data = {
  datasets: [
    {
      label: "",
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
      x: {
        ticks: {
          color: "white",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "white",
        },
      },
    },
  },
};
let myChart = new Chart(document.getElementById("myChart"), config);
