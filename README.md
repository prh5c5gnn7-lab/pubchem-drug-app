# 💊 PubChem Drug Info App

**HTML, CSS, JavaScript**로 만든 생활 속 약물 정보 검색 앱입니다.
약물 이름을 영어로 입력하면 **PubChem PUG REST API**에서 정보를 가져와 화면에 보여줍니다.

---

## 1. 주요 기능

약물 이름(예: `aspirin`)을 검색하면 아래 정보를 볼 수 있습니다.

| 항목 | 설명 | 예시 (aspirin) |
|---|---|---|
| 이름 | PubChem에 등록된 대표 이름 | Aspirin |
| PubChem CID | PubChem이 화합물마다 붙인 고유 번호 | 2244 |
| 분자식 | 분자를 이루는 원자의 종류와 개수 | C9H8O4 |
| 분자량 | 분자 하나의 무게 (단위: g/mol) | 180.16 |
| IUPAC 이름 | 국제 규칙에 따른 정식 화학 이름 | 2-acetyloxybenzoic acid |
| 설명 | 화합물에 대한 영문 설명과 출처 | Acetylsalicylic acid is ... |
| 화학 구조 이미지 | 분자 구조 그림 | (PNG 이미지) |

그 밖의 편의 기능:
- **예시 버튼**: aspirin, ibuprofen, acetaminophen, caffeine을 한 번에 검색
- **Enter 키 검색**: 버튼을 누르지 않고 Enter만 눌러도 검색
- **오류 안내**: 없는 약 이름이거나 인터넷 연결에 문제가 있으면 안내 메시지 표시
- **PubChem 링크**: 결과 카드에서 PubChem 상세 페이지로 이동
- **반응형 화면**: 휴대폰처럼 좁은 화면에서도 보기 좋게 배치

---

## 2. 실행 방법

별도의 프로그램 설치가 필요 없습니다. **인터넷이 연결된 상태**에서 아래처럼 실행하세요.

1. `pubchem-drug-app` 폴더를 엽니다.
2. `index.html` 파일을 더블클릭합니다. (Safari, Chrome 등 웹 브라우저로 열림)
3. 검색창에 약물 이름을 **영어로** 입력하고 **검색** 버튼을 누릅니다.

> 💡 **팁**: PubChem은 영어 이름만 인식합니다.
> "타이레놀" 대신 `acetaminophen`, "아스피린" 대신 `aspirin`처럼 입력하세요.

---

## 3. 폴더 구성

```
pubchem-drug-app/
├── index.html   # 화면 구조 (제목, 검색창, 결과 영역, 안내 문구)
├── style.css    # 디자인 (색상, 배치, 휴대폰 화면 대응)
├── app.js       # 동작 (PubChem API 호출, 결과 표시, 오류 처리)
└── README.md    # 프로젝트 설명서 (이 파일)
```

---

## 4. 동작 원리

```
[사용자] 약물 이름 입력
   ↓
[app.js] PubChem API에 요청
   ↓
[PubChem] JSON 데이터 / 이미지 응답
   ↓
[app.js] 받은 정보를 카드 형태로 화면에 표시
```

### 사용한 PubChem PUG REST API

PUG REST는 **인터넷 주소(URL)만으로** PubChem 데이터를 받아올 수 있는 방식입니다.
기본 주소는 `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound` 입니다.

| 목적 | 요청 주소 (기본 주소 뒤에 붙음) | 받는 데이터 |
|---|---|---|
| 기본 정보 | `/name/{약물이름}/property/Title,MolecularFormula,MolecularWeight,IUPACName/JSON` | 이름, CID, 분자식, 분자량, IUPAC 이름 |
| 설명 | `/cid/{CID}/description/JSON` | 설명 문장과 출처 |
| 구조 이미지 | `/cid/{CID}/PNG` | 화학 구조 그림 |

예를 들어 아래 주소를 브라우저 주소창에 붙여 넣으면 aspirin의 정보를 직접 확인할 수 있습니다.

```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/property/MolecularFormula,MolecularWeight/JSON
```

### 코드에서 사용한 주요 개념

- **`fetch`**: 인터넷 주소로 데이터를 요청하는 JavaScript 기능
- **`async` / `await`**: 인터넷 응답이 올 때까지 기다렸다가 다음 코드를 실행
- **`encodeURIComponent`**: 약물 이름에 공백 등이 있어도 주소가 깨지지 않게 변환
- **`try` / `catch`**: 오류가 나도 앱이 멈추지 않고 안내 메시지를 보여주도록 처리
- **`escapeHtml`**: 외부에서 받은 글자가 HTML 코드로 실행되지 않도록 막는 보안 처리

---

## 5. 데이터 출처

- **PubChem** — 미국 국립보건원(NIH) 산하 **국립생물공학정보센터(NCBI)**가 운영하는 무료 화학 정보 데이터베이스
- 웹사이트: https://pubchem.ncbi.nlm.nih.gov/
- API 안내: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- 설명 문장은 PubChem이 여러 기관에서 모은 자료이며, 화면에 각 설명의 출처가 함께 표시됩니다.

---

## 6. ⚠️ 주의사항

- 이 앱의 정보는 **PubChem의 화학 정보**를 보여주는 것으로, **의학적 진단이나 약 복용에 대한 조언이 아닙니다.**
- 약의 복용법, 용량, 부작용, 다른 약과 함께 먹어도 되는지 등은 반드시 **의사나 약사와 상담**하세요.
- PubChem 데이터는 주로 **영어**로 제공되며, 검색도 영어 이름으로만 가능합니다.
- 약물 이름이 PubChem 공식 표기 그대로 나올 수 있습니다. (예: `Ibuprofen, (+-)-`)
- PubChem 서버에서 정보를 가져오므로 **인터넷 연결이 필요**합니다.
- PubChem은 짧은 시간에 너무 많은 요청을 보내지 않도록 권장합니다. (초당 5회 이하)
