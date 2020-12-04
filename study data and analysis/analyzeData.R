# This file runs the statistical models and tests for the paper:
#   Kyle Thayer, Sarah E. Chasins, and Amy J. Ko. 2020. 
#   A Theory of Robust API Knowledge. ACM Trans. Comput.Educ.1, 1 (December 2020).

library(lmerTest)
library("pscl")
library("lmtest")
library(ordinal) # for clmm
library(RVAideMemoire) # for Anova.clmm
library(MASS) # for polr
library(car) # for Anova for polr
library(plyr)

#########################################################
##################### Load the data #####################
#########################################################

# To load the data files make sure to set your working directory to where these csv files are saved
lineInfo = read.csv("lineInfo.csv",sep=",")
taskInfo = read.csv("taskInfo.csv",sep=",")

#########################################################
##################### Data Cleaning #####################
#########################################################

#simplify the names of the columns about who saw annotations that were incorrect 
lineInfo$badOlTemplate = lineInfo$BadOLTemplate..mislabeled.projection.template.as.interaction.template.
lineInfo$badNaturalFact = lineInfo$Bad.Natural.fact..suggested.trigrams.function.not.ngrams.function.

taskInfo$badOlTemplate = taskInfo$BadOLTemplate..mislabeled.projection.template.as.interaction.template.
taskInfo$badNaturalFact = taskInfo$Bad.Natural.fact..suggested.trigrams.function.not.ngrams.function.

#remove tasks techincal difficulties
lineInfo <- lineInfo[lineInfo["techDiff"] == "false", ]
taskInfo <- taskInfo[taskInfo["techDiff"] == "FALSE", ]

# remove tasks with progress that we ignore.
taskInfo <- taskInfo[is.na(taskInfo["Exclude..task.problem."]), ]

#-------------- Remove rarely answered code lines -------------- #

removeLessRatedLines <- function(tmpLineInfo, tmpTaskInfo, api){
  tmpLineInfo <- tmpLineInfo[lineInfo["api"] == api,]
  maxRatings = nrow(tmpTaskInfo)
  lineCounts = count(lineInfo, c('line'))
  lineCounts$lineFreq = lineCounts$freq
  lineCounts = lineCounts[c("line", "lineFreq")]
  
  tmpLineInfoWithLineCounts = merge(tmpLineInfo, lineCounts, by="line")
  tmpLineInfoWithLineCounts$maxLineCount = maxRatings
  
  tmpLineInfoWithLineCountsFiltered = tmpLineInfoWithLineCounts [tmpLineInfoWithLineCounts["lineFreq"] / maxRatings >= .90,]
  tmpLineInfoWithLineCountsFiltered
}


#naturalLineInfo <- lineInfo[lineInfo["api"] == "Natural",]
naturalTaskInfo = taskInfo[taskInfo["api"] == 'Natural',]
naturalLineInfo <- removeLessRatedLines(lineInfo, naturalTaskInfo, "Natural")

#d3LineInfo <- lineInfo[lineInfo["api"] == "D3",]
d3TaskInfo = taskInfo[taskInfo["api"] == 'D3',]
d3LineInfo <- removeLessRatedLines(lineInfo, d3TaskInfo, "D3")

#threeJSLineInfo <- lineInfo[lineInfo["api"] == "Threejs",]
threeJSTaskInfo = taskInfo[taskInfo["api"] == 'Threejs',]
threeJSLineInfo <- removeLessRatedLines(lineInfo, threeJSTaskInfo, "Threejs")

#openLayersLineInfo <- lineInfo[lineInfo["api"] == "OpenLayers",]
openLayersTaskInfo = taskInfo[taskInfo["api"] == 'OpenLayers',]
openLayersLineInfo <- removeLessRatedLines(lineInfo, openLayersTaskInfo, "OpenLayers")

#combine back together

lineInfoFiltered <- rbind(naturalLineInfo, d3LineInfo)
lineInfoFiltered <- rbind(lineInfoFiltered, threeJSLineInfo)
lineInfoFiltered <- rbind(lineInfoFiltered, openLayersLineInfo)

lineInfo <- lineInfoFiltered

#write.csv(lineInfo, file="lineInfoCleaned.csv")

#-------------- Fix data types -------------- #

lineInfo <- transform(lineInfo,
                      id = as.factor(id)
                      #,numAnTypes = as.factor(numAnTypes)
                      #,stageNum = ordered(stageNum)
                      ,X.LearnedPLs = ordered(X.LearnedPLs, levels=c('1', '2-4', '5-9', '10+'))
                      ,X.LearnedAPIs = ordered(X.LearnedAPIs, levels=c('1', '2-4', '5-9', '10+'))
                      ,debugConf = ordered(debugConf)
)

taskInfo <- transform(taskInfo,
                      id = as.factor(id)
                      #,numAnTypes = as.factor(numAnTypes)
                      #,stageNum = ordered(stageNum)
                      ,X.LearnedPLs = ordered(X.LearnedPLs, levels=c('1', '"2-4"', '"5-9"', '10+'))
                      ,X.LearnedAPIs = ordered(X.LearnedAPIs, levels=c('1', '"2-4"', '"5-9"', '10+'))
                      ,debugConf = ordered(debugConf)
)


#########################################################
########## Statistical models and tests #################
#########################################################


#------------------------------------------------ #
#-------------- Test task progress -------------- #
#------------------------------------------------ #


#-------------- task progress by API (Table 2)---- #

df1 = as.data.frame(taskInfo) # Anova.clmm fails unless we do this
df1$X..completed..subtask.level. = factor(df1$X..completed..subtask.level.)


for (api in c("D3", "Natural", "OpenLayers", "Threejs")){
  api <= "D3"
  
  message  (paste("--- start task progress of annotation type for api",  api,  "----"))
  
  #recompute levels to remove unused levels
  tmpData = df1[df1["api"] == api,]
  tmpData$X..completed..subtask.level. = factor(tmpData$X..completed..subtask.level.)
  
  tmpData$X.LearnedPLs = ordered(tmpData$X.LearnedPLs)
  tmpData$X.LearnedAPIs = ordered(tmpData$X.LearnedAPIs)
  tmpData$debugConf = ordered(tmpData$debugConf)
  
  print ("X.LearnedPLs, X.LearnedAPIs, debugConf")
  print(table(tmpData["X.LearnedPLs"]))
  print(table(tmpData["X.LearnedAPIs"]))
  print(table(tmpData["debugConf"]))
  
  
  #run simplified version of model to get starting values
  # the main model sometimes fails if we don't do this
  m = polr(X..completed..subtask.level. ~ 
             ( has.concept + has.template +  has.fact ) 
           # + X.LearnedPLs 
           + X.LearnedAPIs
           # + debugConf 
           #,data=df1[df1["api"] == api,], 
           ,tmpData,
           Hess=TRUE)
  
  start <- c(
    coef(m), 
    integer(
      length(unique(tmpData$debugConf)) -1  
      + length(unique(tmpData$X.LearnedPLs)) - 1
    ), 
    m$zeta
  )
  
  m = polr(X..completed..subtask.level. ~ 
             ( has.concept + has.template +  has.fact ) 
           + X.LearnedPLs
           + X.LearnedAPIs
           + debugConf  
           # + badNaturalFact #There was a mislabeled natural fact, but it never showed up as significant in any models, so we ignore it
           ,tmpData,
           start = start,
           Hess=TRUE)
  
  
  print(paste("N=",nrow(df1[df1["api"] == api,])) )
  
  # The Anova funcion doesn't work because it tries to build models and gets bad initial values
  # and it doesn't let us supply better starting values, so we calculate p-values manually:
  #Anova(m) #fails :(

  degrees_of_freedom <- m$n - length(coef(m)) - length(m$zeta)
  
  m_summary <- summary(m)
  
  t_values <- m_summary[["coefficients"]][, "t value"]
  
  p_values <- 2*pt(-abs(t_values), degrees_of_freedom)
  
  m_summary[["coefficients"]] <- cbind(m_summary[["coefficients"]], p_values)
  
  print(m_summary)
  
  message (paste("--- end task progress of api",  api, "----"))
  message  ()
}



#-------------- numAnTypes (Table 3) -------------- #
df1$numAnTypes = factor(df1$numAnTypes)
for (api in c("D3", "Natural", "OpenLayers", "Threejs")){
  
  message  (paste("--- start task progress by annotation count for api",  api,  "----"))
  
  #recompute levels to remove unused levels
  tmpData = df1[df1["api"] == api,]
  tmpData$X..completed..subtask.level. = factor(tmpData$X..completed..subtask.level.)
  
  tmpData$X.LearnedPLs = ordered(tmpData$X.LearnedPLs)
  tmpData$X.LearnedAPIs = ordered(tmpData$X.LearnedAPIs)
  tmpData$debugConf = ordered(tmpData$debugConf)
  
  print ("X.LearnedPLs, X.LearnedAPIs, debugConf")
  print(table(tmpData["X.LearnedPLs"]))
  print(table(tmpData["X.LearnedAPIs"]))
  print(table(tmpData["debugConf"]))
  
  m = polr(X..completed..subtask.level. ~ 
             numAnTypes
           #  + X.LearnedPLs
           # + X.LearnedAPIs 
            + debugConf 
           ,tmpData,
           Hess=TRUE)
  
  start <- c(
    coef(m), 
    integer(
      + length(unique(tmpData$X.LearnedAPIs)) -1  
      + length(unique(tmpData$X.LearnedPLs)) - 1
    ) + 0.5, 
    m$zeta
  )
  
  m = polr(X..completed..subtask.level. ~ 
             numAnTypes
            + X.LearnedPLs
            + X.LearnedAPIs 
            + debugConf 
            # + badNaturalFact #There was a mislabeled natural fact, but it never showed up as significant in any models, so we ignore it
           ,tmpData,
           start = start,
           Hess=TRUE)

  print(paste("N=",nrow(df1[df1["api"] == api,])) )
  #print(summary(m))
  
  # The Anova funcion doesn't work because it tries to build models and gets bad initial values
  # and it doesn't let us supply better starting values, so we calculate p-values manually
  
  #Anova(m) #fails :(
  
  degrees_of_freedom <- m$n - length(coef(m)) - length(m$zeta)
  
  m_summary <- summary(m)
  
  t_values <- m_summary[["coefficients"]][, "t value"]
  
  p_values <- 2*pt(-abs(t_values), degrees_of_freedom)
  
  m_summary[["coefficients"]] <- cbind(m_summary[["coefficients"]], p_values)
  
  print(m_summary)
  
  
  #print(Anova(m, type=3))
  message (paste("--- end task progress of api",  api, "----"))
  message  ()
}





#-------------- Task progress for specific examples (Table 4) ----------- #


#### Check specific example of Natrual users making progress on step 1 (ngram) given that they have
#### . This demonstrates that templates were helpful for this task (and facts were not, even when accounting for bad fact)
naturalTaskInfo = taskInfo[taskInfo["api"] == 'Natural',]

naturalTaskInfo$X.LearnedPLs = ordered(naturalTaskInfo$X.LearnedPLs)
naturalTaskInfo$X.LearnedAPIs = ordered(naturalTaskInfo$X.LearnedAPIs)
naturalTaskInfo$debugConf = ordered(naturalTaskInfo$debugConf)


m = glm((X..completed..subtask.level. > 0) ~
          has.concept + has.template +  has.fact
        + X.LearnedPLs 
        + X.LearnedAPIs 
        # + badNaturalFact #There was a mislabeled natural fact, but it never showed up as significant in any models, so we ignore it
        + debugConf 
        ,data=naturalTaskInfo, 
        family=binomial)
print(paste("N=",nrow(naturalTaskInfo)) )
summary(m)
Anova(m, type=3)


#### Check specific example of Natrual users making progress on step 2 (tfidf) given that they have
#### completed task 1 (ngram). This demonstrates that concepts were helpful for this task
naturalTaskInfo = taskInfo[taskInfo["api"] == 'Natural',]
naturalTaskInfoPast1 = naturalTaskInfo[naturalTaskInfo["X..completed..subtask.level."] >= 1,]

naturalTaskInfo$X.LearnedPLs = ordered(naturalTaskInfo$X.LearnedPLs)
naturalTaskInfoPast1$X.LearnedAPIs = ordered(naturalTaskInfoPast1$X.LearnedAPIs)
naturalTaskInfoPast1$debugConf = ordered(naturalTaskInfoPast1$debugConf)


m = glm((X..completed..subtask.level. > 1) ~
          has.concept + has.template +  has.fact
        + X.LearnedPLs 
        + X.LearnedAPIs 
        # + badNaturalFact #There was a mislabeled natural fact, but it never showed up as significant in any models, so we ignore it
        + debugConf 
        ,data=naturalTaskInfoPast1, 
        family=binomial)
print(paste("N=",nrow(naturalTaskInfoPast1)) )
summary(m)
Anova(m, type=3)


#### Check specific example of Openlayers users progress on task 2 (Graticule) given that they have
#### completed task 1 (changing projection). This demonstrates that concepts were helpful for this task
olTaskInfo = taskInfo[taskInfo["api"] == 'OpenLayers',]
olTaskInfoPast1 = olTaskInfo[olTaskInfo["X..completed..subtask.level."] >= 1,]

olTaskInfoPast1$X.LearnedPLs = ordered(olTaskInfoPast1$X.LearnedPLs)
olTaskInfoPast1$X.LearnedAPIs = ordered(olTaskInfoPast1$X.LearnedAPIs)
olTaskInfoPast1$debugConf = ordered(olTaskInfoPast1$debugConf)


# full model
m = glm((X..completed..subtask.level. > 1) ~
          has.concept + has.template +  has.fact
        + X.LearnedPLs 
        + X.LearnedAPIs 
        + debugConf 
        ,data=olTaskInfoPast1, 
        family=binomial)
print(paste("N=",nrow(olTaskInfoPast1)) )
summary(m)
Anova(m, type=3)



#### Check specific example of Threejs users making progress on step 0.5 
#### which generally requires them to use the Torus command

threejsTaskInfo = taskInfo[taskInfo["api"] == 'Threejs',]
threejsTaskInfoAddsObject = threejsTaskInfo[threejsTaskInfo["TorusGeometry.given.object"] != "N/A",]

threejsTaskInfoAddsObject$X.LearnedPLs = ordered(threejsTaskInfoAddsObject$X.LearnedPLs)
threejsTaskInfoAddsObject$X.LearnedAPIs = ordered(threejsTaskInfoAddsObject$X.LearnedAPIs)
threejsTaskInfoAddsObject$debugConf = ordered(threejsTaskInfoAddsObject$debugConf)


m = glm((TorusGeometry.given.object) ~
          has.concept + has.template +  has.fact
        + X.LearnedPLs 
        + X.LearnedAPIs 
        + debugConf 
        ,data=threejsTaskInfoAddsObject, 
        family=binomial)
print(paste("N=",nrow(threejsTaskInfoAddsObject)) )
summary(m)
Anova(m, type=3)


#### Check specific example of Threejs users making progress on step 0.6 
#### which generally requires them to use the parameters of the Torus command correctly

threejsTaskInfo = taskInfo[taskInfo["api"] == 'Threejs',]
threejsTaskInfoAddsTorus = threejsTaskInfo[threejsTaskInfo["X4th.param.correct.given.TorusGeometry"] != "N/A",]

threejsTaskInfoAddsTorus$X.LearnedPLs = ordered(threejsTaskInfoAddsTorus$X.LearnedPLs)
threejsTaskInfoAddsTorus$X.LearnedAPIs = ordered(threejsTaskInfoAddsTorus$X.LearnedAPIs)
threejsTaskInfoAddsTorus$debugConf = ordered(threejsTaskInfoAddsTorus$debugConf)

m = glm((X4th.param.correct.given.TorusGeometry) ~
          has.concept + has.template +  has.fact
        + X.LearnedPLs 
        + X.LearnedAPIs 
        + debugConf 
        ,data=threejsTaskInfoAddsTorus, 
        family=binomial)
print(paste("N=",nrow(threejsTaskInfoAddsTorus)) )
summary(m)
Anova(m, type=3)



#------------------------------------------------ #
#-------------- Test Undersstanding ------------- #
#------------------------------------------------ #


lineInfo$understand = factor(lineInfo$understand)

#-------- Understanding by annotation type (Table 5) ------- #

lineInfo$numAnTypes = factor(lineInfo$numAnTypes)
df2 = as.data.frame(lineInfo)
for (api in c("D3", "Natural", "OpenLayers", "Threejs")){
  message  (paste("--- start understanding of lines by annotation type for api",  api,  "----"))
  
  m = clmm(understand ~
             (has.concept + has.template +  has.fact)
           + X.LearnedPLs + X.LearnedAPIs + debugConf
           #  + badOlTemplate + badNaturalFact #There was a mislabeled natural fact and OpenLayers template, but they never showed up as significant in any models, so we ignore it
           + (1 | line)
           , data=df2[df2["api"] == api,])
  
  print(paste("N=",nrow(df2[df2["api"] == api,])) )
  print(summary(m))
  print(Anova.clmm(m, type=3))
  message (paste("--- end task understanding of api",  api, "----"))
  message  ()
}

lineInfo$numAnTypes = factor(lineInfo$numAnTypes)
df2 = as.data.frame(lineInfo)
for (api in c("D3", "Natural", "OpenLayers", "Threejs")){
  message  (paste("--- start understanding of lines by annotation count for api",  api,  "----"))
  m = clmm(understand ~
             numAnTypes
           + X.LearnedPLs + X.LearnedAPIs + debugConf
           #  + badOlTemplate + badNaturalFact #There was a mislabeled natural fact and OpenLayers template, but they never showed up as significant in any models, so we ignore it
           + (1 | line)
           , data=df2[df2["api"] == api,])
  
  print(paste("N=",nrow(df2[df2["api"] == api,])) )
  print(summary(m))
  print(Anova.clmm(m, type=3))
  message (paste("--- end task understanding of api",  api, "----"))
  message  ()
}



# optional: Find out how much the understanding of each line was influenced by the
# different annotations. Maybe you can figure out something meaningful here.

### Warning: VERY SLOW!!!! ###

# lineBenefitModel = clmm(understand ~
#                           (has.concept + has.fact + has.template) * line
#                         + X.LearnedPLs + X.LearnedAPIs + debugConf
#                         #  + badOlTemplate + badNaturalFact
#                         #+ (1 | stageNum)
#                         + (1 | id)
#                         , data=df2)
# lineBenefitModelSummary = summary(lineBenefitModel)
# lineBenefitModelSummary
#
# write out model to file to be able to analyze it
# write.csv(as.data.frame(lineBenefitModelSummary$coef), file="lineRegressions.csv")

