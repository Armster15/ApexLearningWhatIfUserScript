// ==UserScript==
// @name         Apex Learning "What If" Grades
// @version      1.0.4
// @description  Allows you to play around with your grades and see what you need to achieve a specific grade
// @author       Armster15
// @license      The Unlicense
// @match        https://alvs.apexvs.com/lms/
// @grant        none
// @namespace    https://github.com/Armster15/ApexLearningWhatIfUserScript
// @supportURL   https://github.com/Armster15/ApexLearningWhatIfUserScript
// @require      https://gist.githubusercontent.com/mjblay/18d34d861e981b7785e407c3b443b99b/raw/debc0e6d4d537ac228d1d71f44b1162979a5278c/waitForKeyElements.js
// ==/UserScript==

/* 
Icons from https://ionic.io/ionicons
Source Code formatted with Prettier.js (https://prettier.io)
*/

(function () {
  // @ts-ignore
  const isDev: boolean = typeof esbuildIsDev === 'undefined' ? false : esbuildIsDev;

  const main = async () => {
    // DEV: Reset all the stuff
    document
      .querySelectorAll(
        ".what-if-btn, .what-if-edit-grade-container, .ionicon, .what-if-overall-score-text, .what-if-overall-percent-complete-text"
      )
      .forEach((el) => el.remove());
    document
      .querySelectorAll(`div[col-id="Score"] > div.ag-cell-wrapper`)
      .forEach((el) => (el.style.display = "flex"));

    var pencilIcon = `<svg height="15px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M364.13 125.25L87 403l-23 45 44.99-23 277.76-277.13-22.62-22.62zM420.69 68.69l-22.62 22.62 22.62 22.63 22.62-22.63a16 16 0 000-22.62h0a16 16 0 00-22.62 0z"/></svg>`;
    var alertCircleOutline = `<svg width="20px" color="red" style="margin-right: 3px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512" aria-label="This grade has been modified from its original"><title>This grade has been modified from its original</title><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path d="M250.26 166.05L256 288l5.73-121.95a5.74 5.74 0 00-5.79-6h0a5.74 5.74 0 00-5.68 6z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M256 367.91a20 20 0 1120-20 20 20 0 01-20 20z" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="18px"></path></svg>`;
    var undoIcon = `<svg height="15px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Arrow Undo</title><path d="M240 424v-96c116.4 0 159.39 33.76 208 96 0-119.23-39.57-240-208-240V88L64 256z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/></svg>`;

    var addCSS = (css: string) =>
      (document.head.appendChild(document.createElement("style")).innerHTML =
        css);

    var strToHTML = (str: string) => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(str, "text/html");
      return doc.body.children[0] as HTMLElement;
    };

    var sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    addCSS(`
    .what-if-btn {
        background: none;
        border: none;
    }

    .what-if-btn:hover {
        cursor: pointer;

        /* Underline hack */
        color: black;
        box-shadow: inset 0 -1px 0 0 black;
    }

    .what-if-btn:focus {
        outline: 1px solid blue;
    }

    .what-if-edit-grade-input {
      width: 30px;
    }

    .what-if-edit-grade-input:focus {
      outline: 1px solid blue;
    }

    .what-if-overall-score-text {
      display: flex;
    }
`);

    await sleep(100);

    var rows = Array.from(
      document.querySelectorAll(`.ag-center-cols-container div[role="row"]`)
    );

    for (const row of rows) {
      const titleOfAssignmentBox = row.children[0] as HTMLDivElement;

      const titleOfAssignment = titleOfAssignmentBox.innerText.trim();

      /*
  Rough structure of the score box using the JS variable names:
  <scoreBox>
    <scoreTextParent>
      <svg title="Exclamation mark with circle if grade is changed with what-if"></svg>
      <span>20</span>
      <button class="what-if-btn">
        <svg>...</svg>
      </button>
    </scoreTextParent>

    <editScoreDiv>
    </editScoreDiv>
  </scoreBox>
  */

      const scoreBox = row.children[1] as HTMLDivElement;
      const scoreTextParent = scoreBox.querySelector("div.ag-cell-wrapper")!;
      const scoreTextSpan = scoreTextParent.querySelector("span")!;
      if (!scoreTextSpan.getAttribute("what-if-original-score")) {
        // Only set the what-if-original-score if there already isn't one
        // This is mainly for dev reload purposes
        scoreTextSpan.setAttribute(
          "what-if-original-score",
          scoreTextSpan.innerText
        );
      }

      const possiblePointsBox = row.children[2] as HTMLDivElement;
      const possiblePointsNum = Number(possiblePointsBox.innerText);

      const percentBox = row.children[3] as HTMLDivElement;
      const percentSpan = percentBox.querySelector("span")!;
      if (!percentSpan.getAttribute("what-if-original-percent")) {
        // Only set the what-if-original-score if there already isn't one
        // This is mainly for dev reload purposes
        percentSpan.setAttribute(
          "what-if-original-percent",
          percentSpan.innerText
        );
      }

      const editScoreDiv = document.createElement("div");
      editScoreDiv.classList.add("what-if-edit-grade-container");
      editScoreDiv.style.display = "none";
      editScoreDiv.innerHTML = `
    <input class="what-if-edit-grade-input" />
    <span>/ ${possiblePointsNum}</span>
  `;

      const undoButton = document.createElement("button");
      undoButton.innerHTML = undoIcon;
      undoButton.classList.add("what-if-btn");
      undoButton.addEventListener("click", () => {
        alertCircleOutlineEl.style.visibility = "hidden";
        const originalScore = scoreTextSpan.getAttribute(
          "what-if-original-score"
        )!;
        const originalPercent = percentSpan.getAttribute(
          "what-if-original-percent"
        )!;

        scoreTextSpan.innerText = originalScore;
        percentSpan.innerText = originalPercent;

        editScoreDiv.style.display = "none";
        scoreTextParent.style.display = "flex";

        calculateOverallGrade();
      });
      editScoreDiv.appendChild(undoButton);

      scoreBox.appendChild(editScoreDiv);

      var button = document.createElement("button");
      button.innerHTML = pencilIcon;
      button.classList.add("what-if-btn");
      button.title = "Edit Grade";
      button.setAttribute(
        "aria-label",
        `Edit Grade for ${titleOfAssignment}`
      );

      button.addEventListener("click", () => {
        scoreTextParent.style.display = "none";
        editScoreDiv.style.display = "block";

        const scoreRecievedNum = Number(scoreTextSpan.innerText);

        const input = editScoreDiv.querySelector(
          "input.what-if-edit-grade-input"
        )!;
        input.value = String(scoreRecievedNum);
        input.focus();
        input.select();

        const onInputSubmit = () => {
          input.blur();

          const originalScore = Number(
            scoreTextSpan.getAttribute("what-if-original-score")
          );
          const newScore = Number(input.value);

          const rawPercent = (Number(input.value) / possiblePointsNum) * 100;
          const roundedPercent = +rawPercent.toFixed(2);

          scoreTextSpan.innerText = String(newScore);
          editScoreDiv.style.display = "none";
          scoreTextParent.style.display = "flex";

          percentSpan.innerText = `${roundedPercent}%`;

          if (originalScore !== newScore) {
            alertCircleOutlineEl.style.visibility = "visible";
          } else {
            alertCircleOutlineEl.style.visibility = "hidden";
          }

          calculateOverallGrade();
        };

        input.addEventListener("blur", async () => {
          await sleep(5);

          // Only trigger input submit when the focus goes to something NOT in the edit div
          if (!editScoreDiv.contains(document.activeElement)) {
            onInputSubmit();
          }
        });
        input.addEventListener(
          "keyup",
          (e) => e.key === "Enter" && onInputSubmit()
        );
      });

      scoreTextParent.append(button);

      const alertCircleOutlineEl = strToHTML(
        alertCircleOutline
      ) as unknown as SVGElement;
      alertCircleOutlineEl.style.visibility = "hidden";
      scoreTextParent.prepend(alertCircleOutlineEl);
    }

    const overallScoreText = document.createElement("p");
    overallScoreText.classList.add("what-if-overall-score-text");
    document
      .querySelector("div.activitiesListSection")
      ?.parentElement?.insertBefore(
        overallScoreText,
        document.querySelector("div.activitiesListSection")!
      );

    
    const overallPercentCompleteText = document.createElement("p");
    overallPercentCompleteText.classList.add("what-if-overall-percent-complete-text");
    document
      .querySelector("div.activitiesListSection")
      ?.parentElement?.insertBefore(
        overallPercentCompleteText,
        document.querySelector("div.activitiesListSection")!
      );


    const calculateOverallGrade = () => {
      // Overall grade text
      var pointsEarned = 0;
      var pointsTotal = 0;
      var allPotentialCoursePoints = 0;

      for (const row of rows) {
        var children = Array.from(row.children) as HTMLElement[];

        if (children[1].innerText.replace(/ /g, "") !== "") {
          pointsEarned += Number(children[1].innerText);
          pointsTotal += Number(children[2].innerText);
        }
        allPotentialCoursePoints += Number(children[2].innerText);
      }

      const rawPercent = (pointsEarned / pointsTotal) * 100;
      const roundedPercent = +rawPercent.toFixed(1);

      if (isAnyGradeModified()) {
        overallScoreText.innerHTML = `${alertCircleOutline} <b>Overall Score: </b> <span title="${rawPercent}%">&nbsp;${roundedPercent}%</span>`;
      } else {
        overallScoreText.innerHTML = `<b>Overall Score:</b> <span title="${rawPercent}%">&nbsp;${roundedPercent}%</span>`;
      }

      // The first row that has all points earned by user and all potential points that can be earned in the whole course
      const firstRow = document.querySelector(
        `.ag-floating-top-container div[row-id="t-0"]`
      )!;
      (firstRow.children[1] as HTMLElement).innerText = String(pointsEarned);
      (firstRow.children[2] as HTMLElement).innerText = String(
        allPotentialCoursePoints
      );
      (firstRow.children[3] as HTMLElement).innerText =
        String(
          +((pointsEarned / allPotentialCoursePoints) * 100).toFixed(1)
        ) + "%";
    };

    const isAnyGradeModified = () => {
      var isModified = false;
      for (const el of Array.from(
        document.querySelectorAll(`span[what-if-original-score]`)
      )) {
        if (
          !(
            el.getAttribute("what-if-original-score")!.trim() ==
            el.innerText.trim()
          )
        ) {
          // If modified
          isModified = true;
          break;
        }
      }
      return isModified;
    };

    const percentOfCourseCompleted = () => {
      var completed = 0;

      for(const row of rows) {
          let text = (row.children[4] as HTMLElement).innerText.toLowerCase();
          if(text == "complete" || text == "submitted" || text == "teacher entered") {
              completed += 1;
          }
      }
      
      const rawPercent = (completed / rows.length) * 100;
      const roundedPercent = +rawPercent.toFixed(1);

      overallPercentCompleteText.innerHTML = `<b title="Not your grade :)">Activities Completed:</b> <span>${completed}/${rows.length}</span> <span title="${rawPercent}%">(${roundedPercent}%)</span>`
    }

    calculateOverallGrade();
    percentOfCourseCompleted();
  };

  if(isDev) main()
  else waitForKeyElements(`div.ag-root-wrapper`, () => {
    main()
  })
})();
