document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('assistantForm');
    const resultDiv = document.getElementById('result');
    const actionButtons = document.getElementById('actionButtons');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        generateAndDisplaySuggestions();
    });

    async function generateAndDisplaySuggestions() {
        const role = document.getElementById('role').value;
        const company = document.getElementById('company').value;
        const years = document.getElementById('years').value;
        const skills = document.getElementById('skills').value;
        const achievements = document.getElementById('achievements').value;

        resultDiv.innerHTML = 'Generating suggestions...';

        try {
            const roleSuggestion = await generateSuggestion("role", role);
            const companySuggestion = await generateSuggestion("company", company);
            const yearsSuggestion = await generateSuggestion("years", years);
            const skillsSuggestion = await generateSuggestion("skills", skills);
            const achievementsSuggestion = await generateSuggestion("achievements", achievements);

            displaySuggestions([roleSuggestion, companySuggestion, yearsSuggestion, skillsSuggestion, achievementsSuggestion]);
            actionButtons.style.display = 'block';
        } catch (error) {
            resultDiv.innerHTML = "An error occurred while generating suggestions. Please try again later.";
            console.error("Error:", error);
        }
    }

    async function generateSuggestion(field, value) {
        let prompt = "";
        switch (field) {
            case "role":
                prompt = `Role/Title: ${value}. Rephrase this into a concise and professional sentence highlighting expertise and experience (within 100 words).`;
                break;
            case "company":
                prompt = `Company/Organization: ${value}. Rephrase this into a concise sentence describing the company and its industry leadership, if applicable (within 250 words).`;
                break;
            case "years":
                prompt = `Years of Experience: ${value}. Rephrase this into a concise sentence emphasizing the extent of relevant experience (within 250 words).`;
                break;
            case "skills":
                prompt = `Key Skills: ${value}. Rephrase this into a concise sentence showcasing the breadth and depth of skills (within 500 words).`;
                break;
            case "achievements":
                if (value.length < 50) {
                    prompt = `Key Achievements/Highlights: ${value}. Rephrase this into a detailed sentence, elaborating on the achievement and its impact (within 100 words). Provide specific details and quantifiable results whenever possible.`;
                } else {
                    prompt = `Key Achievements/Highlights: ${value}. Rephrase this into a concise and impactful sentence, highlighting the key achievement (within 70 words).`;
                }
                break;
        }

        const url = 'http://localhost:3001/generate';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }

            const data = await response.json();
            if (!data.suggestion) {
                throw new Error("No suggestion generated.");
            }
            return data.suggestion;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    function displaySuggestions(suggestions) {
        const ul = document.createElement('ul');
        ul.classList.add('suggestion-list');
        suggestions.forEach((suggestion, index) => {
            const li = document.createElement('li');

            const container = document.createElement('div');
            container.classList.add('suggestion-container');

            const textarea = document.createElement('textarea');
            textarea.value = suggestion;
            textarea.setAttribute('data-index', index);

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                textarea.focus();
            });
            container.appendChild(editButton);

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.addEventListener('click', () => {
                updateSuggestion({
                    target: textarea
                });
            });
            container.appendChild(saveButton);

            container.appendChild(textarea);
            li.appendChild(container);
            ul.appendChild(li);
        });
        resultDiv.innerHTML = '';
        resultDiv.appendChild(ul);
        actionButtons.style.display = 'block';
    }

    function updateSuggestion(event) {
        const index = event.target.getAttribute('data-index');
        const updatedSuggestion = event.target.value;
        const suggestionsList = resultDiv.querySelector('.suggestion-list');
        const listItems = suggestionsList.querySelectorAll('li');
        const listItemToUpdate = listItems[index];
        listItemToUpdate.innerHTML = '';
        listItemToUpdate.textContent = updatedSuggestion;
    }

    window.updateFields = function () {
        const suggestionsList = resultDiv.querySelector('.suggestion-list');
        const suggestions = suggestionsList.querySelectorAll('li');
        document.getElementById('role').value = suggestions[0].textContent;
        document.getElementById('company').value = suggestions[1].textContent;
        document.getElementById('years').value = suggestions[2].textContent;
        document.getElementById('skills').value = suggestions[3].textContent;
        document.getElementById('achievements').value = suggestions[4].textContent;
        actionButtons.style.display = 'none';
        resultDiv.innerHTML = 'Fields updated with suggestions!';
    };

    window.submitForm = function () {
        const formData = {
            role: document.getElementById('role').value,
            company: document.getElementById('company').value,
            years: document.getElementById('years').value,
            skills: document.getElementById('skills').value,
            achievements: document.getElementById('achievements').value
        };
    
        fetch('http://localhost:3001/save-form', { // Ensure correct URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return response.json().then(errorData => {
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting the form.');
        });
    };

        resultDiv.innerHTML = 'Form submitted!';
    
});