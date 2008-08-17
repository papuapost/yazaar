/*
Copyright (c) 2007, Frank W. Zammetti

All rights reserved.

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this 
  list of conditions and the following disclaimer. 

* Redistributions in binary form must reproduce the above copyright notice, 
  this list of conditions and the following disclaimer in the documentation 
  and/or other materials provided with the distribution. 

* Neither the name of the <ORGANIZATION> nor the names of its contributors 
  may be used to endorse or promote products derived from this software 
  without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * The Note class represents a single note the user has written.
 */
function Note() {


  /**
   * This is the index in the array that the Note object belongs to where the
   * note is found.  IMPORTANT: This is only set when getNote() in JSNotes is
   * used!  The value should NOT be considered valid at any other time!
   */
  var arrayIndex = null;


  /**
   * This is the tree node object in the treeview representing this Note.
   * IMPORTANT: This is only set when getNote() in JSNotes is
   * used!  The value should NOT be considered valid at any other time!
   */
  var treeNode = null;


  /**
   * The category the note belongs to.
   */
  var noteCategory = null;


  /**
   * The date the note was written.
   */
  var noteDate = null;


  /**
   * The time the note was written.
   */
  var noteTime = null;


  /**
   * The subject of the note.
   */
  var noteSubject = null;


  /**
   * The text of the note.
   */
  var noteText = null;


  /**
   * Field mutator.
   *
   * @param inArrayIndex New value for the field.
   */
  this.setArrayIndex = function(inArrayIndex) {

    arrayIndex = inArrayIndex;

  } // End setArrayIndex().


  /**
   * Field accessor.
   *
   * @return The current value of the field.
   */
  this.getArrayIndex = function() {

    return arrayIndex;

  } // End getArrayIndex().


  /**
   * Field mutator.
   *
   * @param inTreeNode New value for the field.
   */
  this.setTreeNode = function(inTreeNode) {

    treeNode = inTreeNode;

  } // End setTreeNode().


  /**
   * Field accessor.
   *
   * @return The current value of the field.
   */
  this.getTreeNode = function() {

    return treeNode;

  } // End getTreeNode().


  /**
   * Field mutator.
   *
   * @param inNoteCategory New value for the field.
   */
  this.setNoteCategory = function(inNoteCategory) {

    noteCategory = inNoteCategory;

  } // End setNoteCategory().


  /**
   * Field accessor.
   *
   * @return The current value of the field.
   */
  this.getNoteCategory = function() {

    return noteCategory;

  } // End getNoteCategory().


  /**
   * Field mutator.
   *
   * @param inNoteDate New value for the field.
   */
  this.setNoteDate = function(inNoteDate) {

    noteDate = inNoteDate;

  } // End setNoteDate().


  /**
   * Field accessor.
   *
   * @return The current value of the field.
   */
  this.getNoteDate = function() {

    return noteDate;

  } // End getNoteDate().


  /**
   * Field mutator.
   *
   * @param inNoteTime New value for the field.
   */
  this.setNoteTime = function(inNoteTime) {

    noteTime = inNoteTime;

  } // End setNoteTime().


  /**
   * Field accessor.
   *
   * @return The current value of the field.
   */
  this.getNoteTime = function() {

    return noteTime;

  } // End getTime().


  /**
   * Field mutator.
   *
   * @param inNoteSubject New value for the field.
   */
  this.setNoteSubject = function(inNoteSubject) {

    noteSubject = inNoteSubject;

  } // End setNoteSubject().


  /**
   * Field accessor.
   *
   * @return The current value of the field.
   */
  this.getNoteSubject = function() {

    return noteSubject;

  } // End getNoteSubject().


  /**
   * Field mutator.
   *
   * @param inNoteText New value for the field.
   */
  this.setNoteText = function(inNoteText) {

    noteText = inNoteText;

  } // End setNoteText().


  /**
   * Field accessor.
   *
   * @return The current value of the field.
   */
  this.getNoteText = function() {

    return noteText;

  } // End getNoteText().


  /**
   * Overwritten toString() method.
   *
   * @return A meaningful string representation of a Note instance.
   */
  this.toString = function() {

    var s = "Note : { ";
    s += "arrayIndex=" + arrayIndex + ", ";
    s += "treeNode=" + treeNode + ", ";
    s += "noteCategory=" + noteCategory + ", ";
    s += "noteDate=" + noteDate + ", ";
    s += "noteTime=" + noteTime + ", ";
    s += "noteSubject=" + noteSubject + ", ";
    s += "noteText=" + noteText;
    s += " }";
    return s;

  } // End toString().


} // End Note class.
