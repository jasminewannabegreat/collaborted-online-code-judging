import { Component, OnInit , Inject} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import { CollaborationService } from '../../services/collaboration.service';

declare var ace:any;
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  editor : any;
  languages :string[] = ['java','python'];
  language :string = 'java';
  sessionID:string;
  output :string = '';
  defaultContent = {
      'java' : `public class Example {
        public static void main(String[] args) {
          // type your script 
        }
      }`,
      'python':`Class solution:
        def example():
        //type your code here`
  }
  constructor(private collaboration:CollaborationService,
              private route: ActivatedRoute,
              @Inject('data') private data) { }

  ngOnInit() {
    this.route.params.subscribe(params =>{
        this.sessionID = params['id'];
    });
    this.initEditor();
  }
  initEditor():void{
      this.editor = ace.edit('editor');
      this.editor.setTheme('ace/theme/eclipse');
      document.getElementsByTagName('textarea')[0].focus();

      this.resetcode();
      this.collaboration.init(this.editor, this.sessionID);
      this.editor.lastAppliedChange = null;
      this.editor.on('change', e=>{
          console.log("editor changes:"+JSON.stringify(e));
          if(this.editor.lastAppliedChange != e){
              this.collaboration.change(JSON.stringify(e));
          }
      });
      this.editor.getSession().getSelection().on('changeCursor',()=>{
          const cursor = this.editor.getSession().getSelection().getCursor();
          console.log("cursor move",JSON.stringify(cursor));
          this.collaboration.cursorMove(JSON.stringify(cursor));
      });

      this.collaboration.restoreBuffer();
  }
  //submit code to server to run buildANdRun
  submit(){
    const code = this.editor.getValue();
    // console.log(code);
    const codes = {
      code:code,
      lan:this.language.toLowerCase()
    }
    this.data.buildAndRun(codes)
        .then(res => this.output = res.text);
  }

  setLanguage(language:string):void {
    this.output = '';
    this.language = language;
    this.resetcode();
  }

  resetcode ():void{
      console.log('reseting editor...');
      this.editor.getSession().setMode(`ace/mode/${this.language.toLowerCase()}`);
      this.editor.setValue(this.defaultContent[this.language]);
      this.output = '';
  }
}
