# Study data and analysis files


### Files:
* CodedParticipantAnswers.csv
  * Each row of this file is one participant working on the task set for one API.
  * Note: Codebook is appendix A.2 in the paper
  * Fields:
    * id: The participant id
    * api: Which API
    * "# completed (subtask level)": This is the researcher evaluation of how many tasks.subtasks were completed.
    * "# completed (notes)": Additional notes on subtask completion.
    * techDiff: Did this participant have any technical difficulties while working on this API task set.
    * has-concept: Did the participant have concept annotations.
    * has-fact: Did the participant have fact annotations.
    * has-template: Did the participant have template annotations.
    * "What information or strategies did you find most helpful?"
    * "What additional information would you have wanted?"
    * Notes: Additional notes on what we observed about participants or what they told us after the session.
    * Qualitative Code Fields (we grouped the qualitative codes to make it easier to work with):
      * Annotations
      * Nothing
      * Documentation	Code
      * TMI
      * Time
      * Search
      * PrevKnowledge
      * Experiment
      * "PL knowledge"
      * InfoFromDebugger
      * "Other notes"

* taskInfo.csv
  * Each row of this file is one participant working on the task set for one API.
  * This file is used in analyzeData.R
  * Fields:
    * "# complete (circled)": Participants were told to circle the tasks in their task set as they completed them. These are what they circled.
    * "Exclude (task problem)": Some participant tasks sets are excluded because they solved part in a way we were not counting on (e.g., using plain javascript instead of the library)
    * "TorusGeometry given object": For the ThreeJS task, for participants who added an object to the scene, did they then also make it a Torus.
    * "4th param correct given TorusGeometry":  For the ThreeJS task, for participants who created a torus, did they use the 4th parameter to change the smoothing.
    * Misplaced_sphereMollweideProjection_in_layer: For the OpenLayers task, there were two very similar looking parts of code, and the sphereMollweideProjection had to be in the right one to work. Did they put it in the wrong spot?
    * #LearnedPLs: Number of Programming Languages participants said they learned chosen from ranges (note, Excel interprets some of these as dates)
    * #LearnedAPIs: Number of APIs participants said they learned chosen from ranges (note, Excel interprets some of these as dates)
    * debugConf: How confident participants said they were debugging in Javascript in Chrome (1-7)
    * stageNum: Was this a participants' first task, second task, etc.
    * AnyTechDiff: Did this participant have any technical difficulties on any of the API task sets
    * numAnTypes: How many types of annotations did the participant have (0-3)
    * "BadOLTemplate (mislabeled projection template as interaction template)": Some participants saw a mislabeled template annotation in OpenLayers (we fixed it for later participants)
    * "Bad Natural fact (suggested trigrams function not ngrams function)": Some participants saw an incorrect fact annotation in OpenLayers (we fixed it for later participants)

* lineInfo.csv
  * Fields (that aren't already described above):
    * line: What line number in which API are participants rating their understanding of?
    * understand: How did participants rate their understanding of that line (1-5)

* analyzeData.R
  * The R file to run all of our statistical models and tests
  * This uses taskInfo.csv and lineInfo.csv

* analyzeDataOutput.txt/analyzeDataOutput.rtf
  * The output from running analyzeData.R
  * The rtf file preserves the colors for the text, which can make it easier to read
