import { Component, OnInit, Inject } from '@angular/core';
import {problem} from 'app/data-structure/problem';
//define the default problem setting
const DEFAULT_PROBLEM:problem=Object.freeze({
  id:0,
  name:'',
  desc:'',
  difficulty:'easy'
});
@Component({
  selector: 'app-new-problem',
  templateUrl: './new-problem.component.html',
  styleUrls: ['./new-problem.component.css']
})
export class NewProblemComponent implements OnInit {
  newProblem: problem=Object.assign({},DEFAULT_PROBLEM);
  difficulties:string[]=["easy","medium","hard","super"];
  constructor(@Inject ('data') private data ) { }

  ngOnInit() {
  }
  addProblem(){
    this.data.addProblem(this.newProblem)
      .catch(error=> console.log(error.body));
    this.newProblem = Object.assign({},DEFAULT_PROBLEM);

  }
}
