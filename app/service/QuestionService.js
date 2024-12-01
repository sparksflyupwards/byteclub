"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fs_1 = require("node:fs");
var QuestionsSchema_1 = require("~/interface/QuestionsSchema");
var QuestionService = /** @class */ (function () {
    function QuestionService() {
        var _this = this;
        // instance props
        this.questionMDObjects = [];
        this.questionsDirectory = "./byteclub-questions";
        this.parseQuestionDetails = function (questionFile) {
            var questionTableString = questionFile.split("---")[1];
            var questionID = questionTableString.split('\n')[0];
            var questionTitle = questionTableString.split('\n')[1];
            var questionDescription = "";
            for (var _i = 0, _a = questionTableString.split('\n').splice(0, 2); _i < _a.length; _i++) {
                var line = _a[_i];
                questionDescription += line;
            }
            console.log(questionID, questionTitle, questionDescription);
            return [questionID, questionTitle, questionDescription];
        };
        this.parseTestCases = function (questionFile) {
            var testCaseString = questionFile.split("---")[2];
            var inputIdentifiers = new Set();
            var inputValues = [];
            var outputs = [];
            for (var _i = 0, _a = testCaseString.split("```"); _i < _a.length; _i++) {
                var line = _a[_i];
                if (line.includes("json")) {
                    for (var _b = 0, _c = line.split("\n"); _b < _c.length; _b++) {
                        var row = _c[_b];
                        if (row.includes(":")) {
                            var rowIdentifier = row.split(":")[0];
                            var rowValue = row.split(":")[1];
                            inputIdentifiers.add(rowIdentifier);
                            inputValues.push(rowValue);
                        }
                        else if (row.includes("[")) {
                            outputs.push(row);
                        }
                    }
                }
            }
            return [__spreadArray([], inputIdentifiers, true), inputValues, outputs];
        };
        this.parseQuestionFiles = function (questionFiles) {
            questionFiles.forEach(function (fileName) {
                if (fileName.split(".")[1] === "md") {
                    var questionFile = node_fs_1.default.readFileSync(_this.questionsDirectory + "/" + fileName, "utf-8");
                    var _a = _this.parseQuestionDetails(questionFile), questionID = _a[0], questionTitle = _a[1], questionDescription = _a[2];
                    var _b = _this.parseTestCases(questionFile), inputIdentifiers = _b[0], inputValues = _b[1], outputs = _b[2];
                    var tc = new QuestionsSchema_1.TestCases(inputIdentifiers, inputValues, outputs);
                    var qs_1 = new QuestionsSchema_1.Question(questionID, questionTitle, questionDescription, tc);
                    _this.questionMDObjects.push(qs_1);
                }
            });
        };
        var questionFiles = node_fs_1.default.readdirSync(this.questionsDirectory);
        if (questionFiles) {
            this.parseQuestionFiles(questionFiles);
        }
        console.log("here");
    }
    return QuestionService;
}());
exports.default = QuestionService;
