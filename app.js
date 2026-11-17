// ===============================
// 생활 속 약물 정보 검색 - app.js
// PubChem API로 약물 정보를 가져와 화면에 보여준다.
// ===============================

// PubChem API의 기본 주소
const API_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound";

// index.html에서 사용할 요소들을 가져온다
const searchForm = document.getElementById("searchForm");
const drugInput = document.getElementById("drugInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const result = document.getElementById("result");
const exampleButtons = document.querySelectorAll(".example-btn");

// -------------------------------
// 1. 이벤트 연결
// -------------------------------

// 검색 버튼 클릭 또는 Enter 키를 누르면 실행
searchForm.addEventListener("submit", function (event) {
  event.preventDefault(); // form의 기본 동작(페이지 새로고침)을 막는다
  const name = drugInput.value.trim(); // 앞뒤 공백 제거
  if (name) {
    searchDrug(name);
  }
});

// 예시 버튼을 누르면 입력창에 이름을 넣고 바로 검색
exampleButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const name = button.dataset.name; // data-name 값
    drugInput.value = name;
    searchDrug(name);
  });
});

// -------------------------------
// 2. 검색 기능 (핵심)
// -------------------------------

async function searchDrug(name) {
  // 검색 시작: 이전 결과 지우고, 버튼 잠시 비활성화
  result.innerHTML = "";
  showMessage("🔍 검색 중...", "info");
  searchBtn.disabled = true;

  try {
    // (1) 기본 정보 가져오기: 이름, 분자식, 분자량, IUPAC 이름
    const info = await fetchProperties(name);

    // (2) 설명 문장 가져오기 (없어도 괜찮음)
    const description = await fetchDescription(info.CID);

    // (3) 화면에 결과 표시
    showResult(info, description);
    showMessage("", "");
  } catch (error) {
    // 오류 종류에 따라 안내 메시지를 다르게 보여준다
    if (error.message === "NOT_FOUND") {
      showMessage(
        `"${name}"에 대한 정보를 찾을 수 없습니다. 영어 이름과 철자를 확인해 주세요.`,
        "error"
      );
    } else {
      showMessage("정보를 불러오는 중 문제가 생겼습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.", "error");
      console.error(error); // 개발자용: 브라우저 콘솔에 자세한 오류 출력
    }
  } finally {
    // 성공이든 실패든 버튼은 다시 사용 가능하게
    searchBtn.disabled = false;
  }
}

// -------------------------------
// 3. PubChem API 호출 함수들
// -------------------------------

// 약물 이름으로 기본 속성을 가져온다
async function fetchProperties(name) {
  // encodeURIComponent: 이름에 공백 등 특수문자가 있어도 주소가 깨지지 않게 변환
  const url = `${API_BASE}/name/${encodeURIComponent(name)}/property/Title,MolecularFormula,MolecularWeight,IUPACName/JSON`;
  const response = await fetch(url);

  // 404 = PubChem에 해당 이름이 없음
  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!response.ok) {
    throw new Error("서버 오류: " + response.status);
  }

  const data = await response.json();
  // 결과는 PropertyTable.Properties 배열에 들어 있다. 첫 번째 결과를 사용
  return data.PropertyTable.Properties[0];
}

// CID(PubChem 화합물 번호)로 설명 문장을 가져온다
async function fetchDescription(cid) {
  try {
    const url = `${API_BASE}/cid/${cid}/description/JSON`;
    const response = await fetch(url);
    if (!response.ok) {
      return null; // 설명이 없으면 그냥 생략
    }

    const data = await response.json();
    const items = data.InformationList.Information;

    // 설명(Description)이 있는 항목 중 가장 긴 것을 고른다 (보통 가장 자세함)
    let best = null;
    items.forEach(function (item) {
      if (item.Description && (!best || item.Description.length > best.Description.length)) {
        best = item;
      }
    });
    return best;
  } catch (error) {
    return null; // 설명은 부가 정보라서 실패해도 전체 검색은 계속
  }
}

// -------------------------------
// 4. 화면 표시 함수들
// -------------------------------

// 결과 카드를 만들어 화면에 넣는다
function showResult(info, description) {
  const cid = info.CID;
  const imageUrl = `${API_BASE}/cid/${cid}/PNG`;          // 구조 이미지
  const pageUrl = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`; // PubChem 상세 페이지

  // 설명 부분 HTML (설명이 없으면 안내 문구)
  let descriptionHtml = "<p class='no-desc'>등록된 설명이 없습니다.</p>";
  if (description) {
    descriptionHtml = `
      <p>${escapeHtml(description.Description)}</p>
      <p class="source">출처: ${escapeHtml(description.DescriptionSourceName || "PubChem")}</p>
    `;
  }

  result.innerHTML = `
    <div class="card">
      <h2>${escapeHtml(info.Title || "이름 없음")}</h2>

      <div class="card-body">
        <img src="${imageUrl}" alt="${escapeHtml(info.Title || "")} 분자 구조">

        <table>
          <tr><th>PubChem CID</th><td>${cid}</td></tr>
          <tr><th>분자식</th><td>${escapeHtml(info.MolecularFormula || "-")}</td></tr>
          <tr><th>분자량</th><td>${escapeHtml(String(info.MolecularWeight || "-"))} g/mol</td></tr>
          <tr><th>IUPAC 이름</th><td>${escapeHtml(info.IUPACName || "-")}</td></tr>
        </table>
      </div>

      <div class="description">
        <h3>설명 (영문)</h3>
        ${descriptionHtml}
      </div>

      <a class="more-link" href="${pageUrl}" target="_blank">PubChem에서 자세히 보기 →</a>
    </div>
  `;
}

// 안내/오류 메시지를 보여준다 (type: "info" 또는 "error")
function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
}

// 외부에서 받은 글자에 HTML 태그가 섞여 있어도 그대로 실행되지 않도록 바꿔준다 (보안)
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
