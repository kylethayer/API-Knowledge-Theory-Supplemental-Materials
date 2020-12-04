/*global fetch natural*/

function print(string){
    document.getElementById("output_div").innerHTML += string;
    document.getElementById("output_div").innerHTML += "<br>";
}


var tokenizer = new natural.WordTokenizer();
print(tokenizer.tokenize("your dog has fleas."));
// [ 'your', 'dog', 'has', 'fleas' ]

// tokenizer = new natural.TreebankWordTokenizer();
// print(tokenizer.tokenize("my dog hasn't any fleas."));
// // [ 'my', 'dog', 'has', 'n\'t', 'any', 'fleas', '.' ]

// tokenizer = new natural.RegexpTokenizer({pattern: /\-/});
// print(tokenizer.tokenize("flea-dog"));
// // [ 'flea', 'dog' ]

// tokenizer = new natural.WordPunctTokenizer();
// print(tokenizer.tokenize("my dog hasn't any fleas."));
// // [ 'my',  'dog',  'hasn',  '\'',  't',  'any',  'fleas',  '.' ]


print(natural.JaroWinklerDistance("dixon","dicksonx"));
// 0.7466666666666666
print(natural.JaroWinklerDistance('not', 'same'));
// 0

print(natural.LevenshteinDistance("ones","onez"));
// 1
print(natural.LevenshteinDistance('one', 'one'));
// 0

print(natural.LancasterStemmer.stem("words")); 
// 'word'

natural.LancasterStemmer.attach();
print("i am waking up to the sounds of chainsaws".tokenizeAndStem());
//["wak", "sound", "chainsaw"]
print("chainsaws".stem());
//chainsaw


var NGrams = natural.NGrams;

print(NGrams.bigrams('some words here'));
// [ [ 'some', 'words' ], [ 'words', 'here' ] ]
print(NGrams.bigrams(['some',  'words',  'here']));
// [ [ 'some', 'words' ], [ 'words', 'here' ] ]

print(NGrams.trigrams('some other words here'));
//[ [ 'some', 'other', 'words' ], [ 'other', 'words', 'here' ] ]
print(NGrams.trigrams(['some',  'other', 'words',  'here']));
//[ [ 'some', 'other', 'words' ], [ 'other', 'words', 'here' ] ]

print(NGrams.ngrams('some other words here for you', 4));
//[ [ 'some', 'other', 'words', 'here' ], [ 'other', 'words', 'here', 'for' ], [ 'words', 'here', 'for', 'you' ] ]
print(NGrams.ngrams(['some', 'other', 'words', 'here', 'for',
    'you'], 4));
//[ [ 'some', 'other', 'words', 'here' ], [ 'other', 'words', 'here', 'for' ], [ 'words', 'here', 'for', 'you' ] ]


var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();

tfidf.addDocument('this document is about node.');
tfidf.addDocument('this document is about ruby.');
tfidf.addDocument('this document is about ruby and node.');
tfidf.addDocument('this document is about node. it has node examples');

print('node --------------------------------');
tfidf.tfidfs('node', function(i, measure) {
    print('document #' + i + ' is ' + measure);
});
// node --------------------------------
// document #0 is 1
// document #1 is 0
// document #2 is 1
// document #3 is 2

print('ruby --------------------------------');
tfidf.tfidfs('ruby', function(i, measure) {
    print('document #' + i + ' is ' + measure);
});
// ruby --------------------------------
// document #0 is 0
// document #1 is 1.2876820724517808
// document #2 is 1.2876820724517808
// document #3 is 0

print(tfidf.tfidf('node', 0));
// 1
print(tfidf.tfidf('node', 1));
// 0

tfidf.listTerms(0).forEach(function(item) {
    print(item.term + ': ' + item.tfidf);
});
// node: 1
// document: 0.7768564486857903


// var Trie = natural.Trie;
// var trie = new Trie();

// trie.addString("test");
// trie.addStrings(["string1", "string2", "string3"]);
// print(trie.contains("test"));
// // true
// print(trie.contains("asdf")); 
// // false
// print(trie.findPrefix("tester"));     
// // ['test', 'er']
// print(trie.findPrefix("string4"));    
// // [null, '4']
// print(trie.findPrefix("string3"));    
// // ['string3', '']


// var corpus = ['something', 'soothing'];
// var spellcheck = new natural.Spellcheck(corpus);
// print(spellcheck.isCorrect('cat')); 
// // false
// print(spellcheck.getCorrections('soemthing', 1));
// // ['something']
// print(spellcheck.getCorrections('soemthing', 2));
// // ['something', 'soothing']


var lexicon = new natural.Lexicon("lib/lexicon_from_posjs.json", 'N');
var rules = new natural.RuleSet("lib/tr_from_posjs.txt");
var tagger = new natural.BrillPOSTagger(lexicon, rules);

var sentence = ["I", "see", "the", "man", "with", "the", "telescope"];
print(JSON.stringify(tagger.tag(sentence)));
// [["I","NN"],["see","VB"],["the","DT"],["man","NN"],["with","IN"],["the","DT"],["telescope","NN"]]