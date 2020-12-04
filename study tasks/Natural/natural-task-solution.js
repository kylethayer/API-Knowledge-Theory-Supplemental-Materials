/*global fetch natural*/

/***************
Code you will need to modify
 - findWordsForCharacters is called when the book text has loaded.
 - findWordsForCharacters calls getWordsNextToCharacterName.
 - search is called when a user presses the search button
***************/

var tfidf;

var rulesFilename = "lib/tr_from_posjs.txt";
var lexiconFilename = "lib/lexicon_from_posjs.json";
var defaultCategory = 'N';

var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);

// Gets called when the books have been loaded
function findWordsForCharacters(books){
    var TfIdf = natural.TfIdf;
    tfidf = new TfIdf();
    
    //find words that appear near each character name
    for(let i = 0; i < characters.length; i++){
        
        // set variables for this character and book
        var bookText = books[characters[i].book];
        var characterName = characters[i].name;
        
        //extract words that appear near a character in their book
        var characterNgramWords = getWordsNextToCharacterName(bookText, characterName);
        
        tfidf.addDocument(characterNgramWords);
    }
    
    //output associated words for each character
    document.getElementById("output1").innerHTML = "";
    for(let i = 0; i < characters.length; i++){
        displayNameAndBook(characters[i].name, characters[i].book);
        
        // TODO find the words particularly associated with
        // the character compared to others
        var characterWords = tfidf.listTerms(i);
        
        // display words associated with the character
        for(let j = 0; j < characterWords.length && j < 40; j++){
            displayText(characterWords[j].term + ", ");
        }
        
        displayNewLine();
    }
}

// Extract words tha appear in ngrams that start or end with
// the character name in the book. Return these words in a string.
function getWordsNextToCharacterName(bookText, character){
    
    // find all trigrams in the book
    var NGrams = natural.NGrams;
    var bookNgrams = NGrams.ngrams(bookText, 7);
    
    // select nGrams where character name was first or last 
    // string in ngram to get all words before and after the name
    var filteredBookNgrams = bookNgrams.filter(function(ngram){
        return ngram[0] == character || ngram[ngram.length - 1] == character;
    });
    
    // create a string with all words that appeared in the filteredngrams
    var words = "";
    for(let i = 0; i < filteredBookNgrams.length; i++){
        var ngram = filteredBookNgrams[i];
        var wordTags = tagger.tag(ngram);
        
        // individually add each word from the ngram (excluding the character name)
        for(let j = 0; j < wordTags.length; j++){
            var word = wordTags[j][0];
            var pos =  wordTags[j][1];
            if(word != character && !["PRP", "PRP$", "IN", "DT", "CC"].includes(pos)){
                word = natural.LancasterStemmer.stem(word);
                words += " " + word;
            }
        }
    }
    return words;
}

// when the user presses search, find the characters that best match that entered terms
function search(){
    // get search term from inut box
    var searchTerms = document.getElementById("searchinput").value;
    searchTerms = natural.LancasterStemmer.stem(searchTerms);
    
    // if the user did actually enter terms
    if(searchTerms && searchTerms.length > 0){
        var termMatch = [];
        
        // for each character, find how well they match
        for(let i = 0; i < characters.length; i++){
            termMatch.push({
                name: characters[i].name,
                book: characters[i].book,
                match: tfidf.tfidf( searchTerms, i)
            });
        }
        
        sortAndDisplayTerms(termMatch);
    }
}

/***************
Additional code that you don't need to worry about: 
  creating characters array, loading books, and helper functions
***************/

// Set up the character names to look for
var characters = [
    {name: "Elizabeth", book: "pride_and_prejudice"},
    {name: "Darcy", book: "pride_and_prejudice"},
    {name: "Bingley", book: "pride_and_prejudice"},
    {name: "Jane", book: "pride_and_prejudice"},
    {name: "Wickham", book: "pride_and_prejudice"},
    {name: "Collins", book: "pride_and_prejudice"},
    {name: "Lydia", book: "pride_and_prejudice"},
    {name: "Mary", book: "pride_and_prejudice"},
    {name: "Kitty", book: "pride_and_prejudice"},
    {name: "Charlotte", book: "pride_and_prejudice"},
    {name: "Elinor", book: "sense_and_sensibility"},
    {name: "Marianne", book: "sense_and_sensibility"},
    {name: "Jennings", book: "sense_and_sensibility"},
    {name: "Willoughby", book: "sense_and_sensibility"},
    {name: "Edward", book: "sense_and_sensibility"},
    {name: "Lucy", book: "sense_and_sensibility"},
    {name: "Brandon", book: "sense_and_sensibility"},
    {name: "Middleton", book: "sense_and_sensibility"},
    {name: "Emma", book: "emma"},
    {name: "Weston", book: "emma"},
    {name: "Knightley", book: "emma"},
    {name: "Elton", book: "emma"},
    {name: "Harriet", book: "emma"},
    {name: "Fairfax", book: "emma"},
    {name: "Churchill", book: "emma"},
    {name: "Bates", book: "emma"}
];


// * load three Jane Austin books and call processBooks() to start
// * set up search button handler
window.onload = function(){
    var pride_and_prejudice, sense_and_sensibility, emma;
    Promise.all([
        fetch("pride_and_prejudice.txt", {credentials: 'include'}).then(checkStatus).then(function(resonseText){pride_and_prejudice = resonseText;}),
        fetch("sense_and_sensibility.txt", {credentials: 'include'}).then(checkStatus).then(function(resonseText){sense_and_sensibility = resonseText;}),
        fetch("emma.txt", {credentials: 'include'}).then(checkStatus).then(function(resonseText){emma = resonseText;})
    ]).then(function(){
        findWordsForCharacters({
            pride_and_prejudice: pride_and_prejudice, 
            sense_and_sensibility: sense_and_sensibility, 
            emma: emma
        });
    });
    
    document.getElementById("searchButton").onclick = search;
};




// utility to help rounding for printing
function roundOneDecimal(number){
    return Math.round(number*10)/10;
}

//utility to help load files through AJAX fetch calls
function checkStatus(response) {  
  if (response.status >= 200 && response.status < 300) {  
    return response.text();
  } else {  
    return Promise.reject(new Error(response.status + ": " + response.statusText)); 
  } 
}

//utility to output character name and book
function displayNameAndBook(name, book){
    document.getElementById("output1").innerHTML += "<strong>" + name + "</strong>";
    document.getElementById("output1").innerHTML += " (" + book + ")<br>";
}

// utility to output an html new line
function displayNewLine() {
    document.getElementById("output1").innerHTML += "<br>";
}

// utility to output text
function displayText(text){
    document.getElementById("output1").innerHTML += text;
}

// utility to sort terms from a search and print them
function sortAndDisplayTerms(termMatch){
        
        // sort characters by match
        termMatch.sort(function(a, b){
            return b.match - a.match;
        });
        
        // output character information (in the sorted order)
        document.getElementById("output2").innerHTML = "";
        for(let i = 0; i < termMatch.length; i++){
            document.getElementById("output2").innerHTML += "<strong>" + termMatch[i].name + "</strong> ";
            document.getElementById("output2").innerHTML += "(" + termMatch[i].book + ")<br>";
            document.getElementById("output2").innerHTML += " &nbsp; ";
            document.getElementById("output2").innerHTML += roundOneDecimal(termMatch[i].match);
            document.getElementById("output2").innerHTML += "<br>";
        }
}