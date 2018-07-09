<?php
	/*
		@author Aadhithya Kannan
		@date   20 November 2017
		COPYRIGHT SANDBOX LLC
	*/

	require "checklogin.php";
	$text = json_decode(file_get_contents("languages/en-US.json"), true);
?>

<!DOCTYPE HTML>
<html lang="en">
	<head>
		<title><?php echo $text["title"]; ?></title>
		<link rel="stylesheet" type="text/css" href="css/playground.css" />
		<link href="node_modules/fine-uploader/all.fine-uploader/fine-uploader-new.css" rel="stylesheet">
		<link rel="stylesheet" href="../FontAwesome/web-fonts-with-css/css/fontawesome-all.css" />
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>  
		<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js" ></script>
		<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
		<script src="https://togetherjs.com/togetherjs-min.js"></script>
	</head>
	<body>
			<!-- *************************************************** -->
			<!-- ********************* DOWNLOAD ******************** -->
			<!-- *************************************************** -->
		<iframe id="download"></iframe>
		<div id="leftcol">
			<!-- *************************************************** -->
			<!-- ********************* TOOLBAR ********************* -->
			<!-- *************************************************** -->
			<div id="toolbar">
				<input id="newFileButton" class="toolbarButton" type="button"/>
				<input id="newFolderButton" class="toolbarButton" type="button"/>
				<input id="debugButton" class="toolbarButton" type="button"/>
				<input id="runButton" class="toolbarButton" type="button"/>
			</div>

			<!-- *************************************************** -->
			<!-- ******************* FILE MANAGER ****************** -->
			<!-- *************************************************** -->
			<div id="filemanager"></div>

			<!-- *************************************************** -->
			<!-- ******************* CURSOR MENUS ****************** -->
			<!-- *************************************************** -->
			<div id="foldermenu">
				<li id="folderNewFile" class="contextMenuItem"><?php echo $text["newFile"]; ?></li>
				<li id="folderNewFolder" class="contextMenuItem"><?php echo $text["newFolder"]; ?></li>
				<li id="folderRenameFolder" class="contextMenuItem"><?php echo $text["renameFolder"]; ?></li>
				<li id="folderDuplicateFolder" class="contextMenuItem"><?php echo $text["duplicateFolder"]; ?></li>
				<div class="lineBreak"></div>
				<li id="folderDownloadFolder" class="contextMenuItem"><?php echo $text["downloadFolder"]; ?></li>
				<li id="folderUpload" class="contextMenuItem"><?php echo $text["upload"]; ?></li>
				<div class="lineBreak"></div>
				<li id="folderEmpty" class="contextMenuItem"><?php echo $text["emptyFolder"]; ?></li>
				<li id="folderDelete" class="contextMenuItem"><?php echo $text["deleteFolder"]; ?></li>
				<div class="lineBreak"></div>
				<li id="folderRefresh" class="contextMenuItem"><?php echo $text["refreshFiles"]; ?></li>
			</div>

			<div id="filemenu">
				<li id="fileNewFile" class="contextMenuItem"><?php echo $text["newFile"]; ?></li>
				<li id="fileNewFolder" class="contextMenuItem"><?php echo $text["newFolder"]; ?></li>
				<li id="fileRenameFile" class="contextMenuItem"><?php echo $text["renameFile"]; ?></li>
				<li id="fileDuplicateFile" class="contextMenuItem"><?php echo $text["duplicateFile"]; ?></li>
				<div class="lineBreak"></div>
				<li id="fileDownloadFile" class="contextMenuItem"><?php echo $text["downloadFolder"]; ?></li>
				<li id="fileUpload" class="contextMenuItem"><?php echo $text["upload"]; ?></li>
				<div class="lineBreak"></div>
				<li id="fileDelete" class="contextMenuItem"><?php echo $text["deleteFile"]; ?></li>
				<div class="lineBreak"></div>
				<li id="fileRefresh" class="contextMenuItem"><?php echo $text["refreshFiles"]; ?></li>
			</div>
		</div>
		<!-- *************************************************** -->
		<!-- ***************** ACE CODE EDITOR ***************** -->
		<!-- *************************************************** -->
		<div id="editor"></div>
		
		<!-- *************************************************** -->
		<!-- ******************** TERMINAL ********************* -->
		<!-- *************************************************** -->
		<div id="terminal">
			<iframe id="consoleFrame" src="http://localhost:7681/" width=100% height=100%></iframe>
		</div>
		
		<script src="ace_editor/src-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
		<script src="ace_editor/src-noconflict/ext-language_tools.js"></script>
		<script>
			$(document).ready(function(){
				/****************************************************
				 *********** ACTIVE DIRECTORY VARIABLES *************
				 ****************************************************/
				//active directory files
				var active_dir = "/Applications/MAMP/htdocs/Sandbox 2.0/Users/aadhi0319";
				var active_file = "";
				var activeRight = "";
				var ext = "";
				var name = ""
				
				//debug variables
				var debug = true;
				var breakpointAnchors = [];
				
				/****************************************************
				 **************** ACE CODE EDITOR  *******************
				 ****************************************************/
				ace.require("ace/ext/language_tools");
				var editor = ace.edit("editor");
				editor.setOptions({
					enableBasicAutocompletion: true,
					enableSnippets: true,
					enableLiveAutocompletion: false
				});
				editor.setTheme("ace/theme/monokai");
				editor.getSession().setMode("ace/mode/javascript");
				editor.getSession().on('change', function() {
					save(editor, false);					
				});
				
				/****************************************************
				 *************** ACE CODE DEBUGGER  *****************
				 ****************************************************/
				editor.on("guttermousedown", function(e) {
					if(debug){
						var target = e.domEvent.target; 
						if (target.className.indexOf("ace_gutter-cell") == -1) //make sure that user clicked on a gutter cell
							return;

						var breakpoints = e.editor.session.getBreakpoints(row, 0);
						var row = e.getDocumentPosition().row;
						if(typeof breakpoints[row] === typeof undefined){ //add breakpoint
							e.editor.session.setBreakpoint(row);
							breakpointAnchors.push(editor.getSession().getDocument().createAnchor(row, 0)); 
							breakpointAnchors[breakpointAnchors.length-1].on("change", function(element){
								e.editor.session.clearBreakpoint(element.old.row); //moves breakpoint in sync with line of code
								e.editor.session.setBreakpoint(element.value.row);
							});
						}else{ //delete breakpoint
							e.editor.session.clearBreakpoint(row);
							breakpointAnchors.forEach(function(element, index) {
								if(row == element.row){
									element.detach();
									breakpointAnchors.splice(index, 1);	
								}
							});
						}
						e.stop();
					}
				});

				/****************************************************
				 **************** HELPER FUNCTIONS ******************
				 ****************************************************/
				function compile(in_editor){
					$.ajax({	
						type: "POST",
						url: "compile2.php",
						data: {
							code: in_editor.getValue(),
							filepath: active_file
						},
						dataType: "text",
						success: function(data){
							if(data){
								var htmldiv = document.createElement("div");
								htmldiv.innerHTML = data;
								swal({
									content: htmldiv,
									className: "swal-compiled",
									buttons: false
								});
							}else{
								$("#consoleFrame").attr("src", "http://localhost:7680/");
								const socket = new WebSocket('ws://localhost:7680');
								socket.addEventListener('close', function (event) {
									$("#consoleFrame").attr("src", "http://localhost:7681/");
								});
							}
						}
					});
				}
				
				function save(in_editor, notify){
					$.ajax({	
						type: "POST",
						url: "saveFile.php",
						data: {
							code: in_editor.getValue(),
							path: active_file
						},
						dataType: "text",
						success: function(data){
							if(notify)
								swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
						},
						error: function(data){
							if(notify)
								swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
						}
					});
				}
				
				//not yet tested
				function readFile(filepath){
					$.ajax({	
						type: "POST",
						url: "readFile.php",
						data: {
							path: filepath
						},
						dataType: "text",
						success: function(data){
							editor.setValue(data, -1);
							editor.getSession().setMode("ace/mode/"+ext);
						}
					});	
				}
				
				function sleep(ms) {
					return new Promise(resolve => setTimeout(resolve, ms));
				}
					/****************************************************
				 	************* HELPER FUNCTIONS (FILES) **************
				 	****************************************************/
				function createFile(in_editor){
					swal({
					  content: {
						element: "input",
						attributes: {
						  placeholder: "sandbox.txt",
						  type: "text",
						},
					  },
						text: "<?php echo $text["createFilePrompt"]; ?>"
					}).then((value) => {
						ext = value.split(".")[1];
						active_file = active_dir + "<?php echo DIRECTORY_SEPARATOR; ?>" + value;
						  $.ajax({	
							type: "POST",
							url: "newFile.php",
							data: {
								path: active_file
							},
							dataType: "text",
							success: function(data){
								swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
								//replace with readfile later
								$.ajax({	
									type: "POST",
									url: "readFile.php",
									data: {
										path: active_file
									},
									dataType: "text",
									success: function(data){
										editor.setValue(data, -1);
										editor.getSession().setMode("ace/mode/"+ext);
									}
								});
								scan();
							},
							error: function(data){
								swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
							}
						});
					});
				}
				
				function renameFile(filepath){
					swal({
					  content: {
						element: "input",
						attributes: {
						  placeholder: "sandbox",
						  type: "text",
						},
					  },
						text:"<?php echo $text["renameFilePrompt"]; ?>"
					}).then((value) => {

						var newdir = filepath.substring(0, filepath.lastIndexOf("/")+1) + value;
						  $.ajax({	
							type: "POST",
							url: "rename.php",
							data: {
								oldpath: filepath,
								newpath: newdir
							},
							dataType: "text",
							success: function(data){
								swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
								scan();
							},
							error: function(data){
								swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
							}
						});
					});
				}
				
				function duplicateFile(filepath){
					$.ajax({	
							type: "POST",
							url: "duplicateFile.php",
							data: {
								filepath: filepath
							},
							dataType: "text",
							success: function(data){
								swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
								scan();
							},
							error: function(data){
								swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
							}
					});
				}
				
				function downloadFile(filepath){
					document.getElementById("download").src = "downloadFile.php?filepath="+encodeURIComponent(filepath);
				}
				
				function deleteFile(filepath){
					swal({
					 	title: "<?php echo $text["deleteFileConfirmTitle"]; ?>",
					  	text: "<?php echo $text["deleteFileConfirmText"]; ?> \""+filepath.substring(filepath.lastIndexOf("/")+1)+"\".",
					  	icon: "warning",
					  	buttons: true,
						dangerMode: true,
					}).then((willDelete) => {
					  	if (willDelete) {
							$.ajax({	
								type: "POST",
								url: "deleteFile.php",
								data: {
									filepath: filepath
								},
								dataType: "text",
								success: function(data){
									swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
									scan();
								},
								error: function(data){
									swal("<?php echo $text["deleteFileError"]; ?>", {
						  				icon: "error",
									});
									scan();
								}
							});
					  }
					});
				}
				
					/****************************************************
				 	************ HELPER FUNCTIONS (FOLDERS) *************
				 	****************************************************/
				function createFolder(){
					swal({
					  content: {
						element: "input",
						attributes: {
						  placeholder: "sandbox",
						  type: "text",
						},
					  },
						text:"<?php echo $text["createFilePrompt"]; ?>"
					}).then((value) => {
						active_dir += "<?php echo DIRECTORY_SEPARATOR; ?>" + value;
						  $.ajax({	
							type: "POST",
							url: "newFolder.php",
							data: {
								folderpath: active_dir
							},
							dataType: "text",
							success: function(data){
								swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
								scan();
							},
							error: function(data){
								swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
							}
						});
					});
				}
				
				function renameFolder(filepath){
					swal({
					  content: {
						element: "input",
						attributes: {
						  placeholder: "sandbox",
						  type: "text",
						},
					  },
						text: "<?php echo $text["renameFolderPrompt"]; ?>"
					}).then((value) => {

						var newdir = filepath.substring(0, filepath.lastIndexOf("/")+1) + value;
						  $.ajax({	
							type: "POST",
							url: "rename.php",
							data: {
								oldpath: filepath,
								newpath: newdir
							},
							dataType: "text",
							success: function(data){
								swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
								scan();
							},
							error: function(data){
								swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
							}
						});
					});
				}
				
				function duplicateFolder(folderpath){
					$.ajax({	
							type: "POST",
							url: "duplicateFolder.php",
							data: {
								folderpath: folderpath
							},
							dataType: "text",
							success: function(data){
								swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
								scan();
							},
							error: function(data){
								swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
							}
					});	
				}
				
				function downloadFolder(folderpath){
					document.getElementById("download").src = "downloadFolder.php?folderpath="+encodeURIComponent(folderpath);

				}
				
				function emptyFolder(folderpath){
					swal({
					 	title: "<?php echo $text["emptyFolderConfirmTitle"]; ?>",
					  	text: "<?php echo $text["emptyFolderConfirmText"]; ?> \""+folderpath.substring(folderpath.lastIndexOf("/")+1)+"\".",
					  	icon: "warning",
					  	buttons: true,
						dangerMode: true,
					}).then((willDelete) => {
					  	if (willDelete) {
							$.ajax({	
								type: "POST",
								url: "emptyFolder.php",
								data: {
									folderpath: folderpath
								},
								dataType: "text",
								success: function(data){
									swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
									scan();
								},
								error: function(data){
									swal("<?php echo $text["emptyFolderError"]; ?>", {
						  				icon: "error",
									});
									scan();
								}
							});
					  }
					});	
				}
				
				function deleteFolder(folderpath){
					swal({
					 	title: "<?php echo $text["deleteFolderTitle"]; ?>",
					  	text: "<?php echo $text["deleteFolderTextBefore"]; ?> \""+folderpath.substring(folderpath.lastIndexOf("/")+1)+"\" <?php echo $text["deleteFolderTextAfter"]; ?>",
					  	icon: "warning",
					  	buttons: true,
						dangerMode: true,
					}).then((willDelete) => {
					  	if (willDelete) {
							console.log(folderpath);
							$.ajax({	
								type: "POST",
								url: "deleteFolder.php",
								data: {
									folderpath: folderpath
								},
								dataType: "text",
								success: function(data){
									swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
									scan();
								},
								error: function(data){
									swal("<?php echo $text["deleteFolderError"]; ?>", {
						  				icon: "error",
									});
									scan();
								}
							});
					  }
					});
				}
				
				/****************************************************
				 ************ TOOLBAR HELPER FUNCTIONS **************
				 ****************************************************/
				$("#newFileButton").on("click",function(){
					createFile(editor);
				});
				
				$("#newFolderButton").on("click",function(){
					createFolder();
				});
				
				$("#debugButton").on("click",function(){
					var breakpoints = "";
					breakpointAnchors.forEach(function(element) {
						breakpoints += (element.row+1)+":";
					});
					breakpoints = breakpoints.substring(0, breakpoints.length-1);
				});
				
				$("#runButton").on("click",function(){
					compile(editor);
				});
				
				/****************************************************
				 ********** FILE MANAGER HELPER FUNCTIONS ***********
				 ****************************************************/
				scan();			
				function scan(){
					$.ajax({	
						type: "POST",
						url: "scan.php",
						data: {
							scandir: ""
						},
						dataType: "text",
						success: function(data){
							document.getElementById("filemanager").innerHTML = data;
							$("#filemanager .file").draggable({
								revert: "invalid"
							});
							$("#filemanager .folder").draggable({
								revert: "invalid"
							});
							$("#filemanager .file").droppable({
								drop: drop
							});
							$("#filemanager .folder").droppable({
								drop: drop
							});
						}
					});
				}
				
				function drop(event, drop){
					var fromPath = drop.draggable.attr("data-wd");
					var toPath = $(this).attr("data-wd");
					if($(this).hasClass("file")){
						toPath = toPath.substring(0,toPath.lastIndexOf("<?php echo DIRECTORY_SEPARATOR; ?>"));
					}
					console.log("From: "+fromPath+"\nTo: "+toPath);
					$.ajax({	
						type: "POST",
						url: "move.php",
						data: {
							from: fromPath,
							to: toPath
						},
						dataType: "text",
						success: function(data){
							swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
							scan();
						}
					});
				}
				
				$("#filemanager").on("click",".file",function(element){
					if($("#filemenu").is(":visible") || $("#foldermenu").is(":visible")){
						return;
					}
					active_file = $(this).attr("data-wd");
					active_dir = active_file.substring(0, active_file.lastIndexOf("/"));
					ext = $(this).attr("data-name").split(".")[1];
					name = $(this).attr("data-name").split(".")[0];
					$.ajax({	
						type: "POST",
						url: "readFile.php",
						data: {
							path: active_file
						},
						dataType: "text",
						success: function(data){
							editor.setValue(data, -1);
							editor.getSession().setMode("ace/mode/"+ext);
						}
					});
					return false;
				});
				
				$("#filemanager").on("click",".folder",function(element){
					if($("#filemenu").is(":visible") || $("#foldermenu").is(":visible")){
						return;
					}
					if($(this).hasClass("expand")){
						$(this).removeClass("expand");
					}else{
						$(this).addClass("expand");
					}
					active_dir = $(this).attr("data-wd");
					return false;
				});
				
				/****************************************************
				 ********************* UPLOAD ***********************
				 ****************************************************/
				$("#folderUpload, #fileUpload").on("click",function(){
					upload(activeRight);
				});
				
				function upload(path){
					$.ajax({	
						type: "POST",
						url: "upload.html",
						dataType: "text",
						success: function(data){
							var uploadBox = document.createElement("iframe");
							uploadBox.id = "uploadBox";
							uploadBox.src = "upload.html";
							uploadBox.width = "100%";
							uploadBox.height = "100%";
							uploadBox.scrolling = "no";
							console.log(uploadBox);
							swal({
								content: uploadBox,
								buttons: false,
								className: "swal-uploadBox"
							});
						}
					});
				}
				
				/****************************************************
				 ********************* COLLAB ***********************
				 ****************************************************/
				function collab(){
					var TogetherJSConfig_dontShowClicks = true;
					var TogetherJSConfig_cloneClicks = true;
					TogetherJS(this);
				}
				
				/****************************************************
				 ****************** CURSOR MENUS ********************
				 ****************************************************/
				//Context Menu Helpers for FOLDERS
				$("#filemanager").on("mousedown",".folder",function(element){
					$(this).attr("oncontextmenu", "return false;");
					if(element.button == 2){
						activeRight = $(this).attr("data-wd");
						$("#foldermenu").css("left", element.pageX+5);
						$("#foldermenu").css("top", element.pageY+5);
						$("#foldermenu").fadeIn(100);
						$("#filemenu").fadeOut(80);
					}
					return false;
				});
				
				$("#folderDelete").on("click",function(){
					deleteFolder(activeRight);
				});
				
				$("#folderNewFile").on("click",function(){
					active_dir = activeRight;
					createFile(editor);
				});
				
				$("#folderNewFolder").on("click",function(){
					active_dir = activeRight;
					createFolder();
				});
				
				$("#folderRenameFolder").on("click",function(){
					renameFolder(activeRight);
				});
				
				$("#folderDuplicateFolder").on("click",function(){
					duplicateFolder(activeRight);
				});
				
				$("#folderDownloadFolder").on("click",function(){
					downloadFolder(activeRight);
				});
				
				$("#folderEmpty").on("click",function(){
					emptyFolder(activeRight);
				});
				
				$("#folderRefresh").on("click",function(){
					scan();
				});
				
				//Makes the context menu disappear on a left click in the body
				$("body").on("click",function(element){
					$(this).attr("oncontextmenu", "return false;");
					if(element.button == 0){
						activeRight = "";
						$("#foldermenu").fadeOut(80);
						$("#filemenu").fadeOut(80);
					}
				});
				
				//Context Menu Helpers for FILES
				$("#filemanager").on("mousedown",".file",function(element){
					$(this).attr("oncontextmenu", "return false;");
					if(element.button == 2){
						activeRight = $(this).attr("data-wd");
						$("#filemenu").css("left", element.pageX+5);
						$("#filemenu").css("top", element.pageY+5);
						$("#filemenu").fadeIn(100);
						$("#foldermenu").fadeOut(80);
					}
					return false;
				});
				
				$("#fileNewFile").on("click",function(){
					active_dir = activeRight.substring(0,activeRight.lastIndexOf("/"));
					createFile(editor);
				});
				
				$("#fileNewFolder").on("click",function(){
					active_dir = activeRight.substring(0,activeRight.lastIndexOf("/"));
					createFolder();
				});
				
				$("#fileRenameFile").on("click",function(){
					renameFile(activeRight);
				});
				
				$("#fileDuplicateFile").on("click",function(){
					duplicateFile(activeRight);
				});
				
				$("#fileDownloadFile").on("click",function(){
					downloadFile(activeRight);
				});
				
				$("#fileDelete").on("click",function(){
					deleteFile(activeRight);
				});
				
				$("#fileRefresh").on("click",function(){
					scan();
				});
				
				/****************************************************
				 ****************** KEY BINDINGS ********************
				 ****************************************************/
				editor.commands.addCommand({
					name: "compile",
					bindKey: {win: "Ctrl-e", mac: "Command-e"},
					exec: function() {
						compile(editor);
					}
				});
				
				editor.commands.addCommand({
					name: "saveFile",
					bindKey: {win: "Ctrl-s", mac: "Command-s"},
					exec: function() {
						save(editor, true);
					}
				});
				
				editor.commands.addCommand({
					name: "newFile",
					bindKey: {win: "Ctrl-n", mac: "Command-right"},
					exec: function() {
						createFile(editor);
					}
				});
				
				editor.commands.addCommand({
					name: "collab",
					bindKey: {win: "Ctrl-k", mac: "Command-k"},
					exec: function() {
						collab();
					}
				});
				
			});
		</script>
	</body>
</html>