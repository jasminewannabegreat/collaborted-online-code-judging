import { Injectable } from '@angular/core';
import { problem } from '../data-structure/problem';
import { PROBLEMS } from '../mock-problem';
import { Http, Response, Headers} from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService {
  //problems:problem[]=PROBLEMS;
  private _problemSource = new BehaviorSubject<problem[]>([]);
  constructor(private http:Http) { }

  getProblems(): Observable<problem[]> {
    //return this.problems;
    this.http.get('api/v1/problems')
        .toPromise()
        .then((res: Response)=>{
            this._problemSource.next(res.json());
        })
        .catch(this.handleError)
        return this._problemSource.asObservable();
  }

  getProblem(id: number){
    //return this.problems.find( (problem ) => problem.id === id);
    return this.http.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: Response) => {
        this.getProblems();
        return res.json();
      })
      .catch(this.handleError);
  }
  addProblem(problem:problem){
    // problem.id = this.problems.length+1;
    // this.problems.push(problem);
    const header = new Headers({'content-type':'application/json'});
    return this.http.post('api/v1/problems',problem,header)
        .toPromise()
        .then((res:Response)=>{
            this.getProblems();
            return res.json();
        })
        .catch(this.handleError)
  }

  buildAndRun (data:any) : Promise<Object>{
    const header = new Headers({'content-type':'application/json'});
    return this.http.post('api/v1/build_and_run',data,header)
        .toPromise()
        .then((res:Response)=>{
            console.log('This code has been built and run',res);
            return res.json();
        })
        .catch(this.handleError)
  }
  

  private handleError(error:any):Promise<any>{
    console.error('An error occured',error);
    return Promise.reject(error);
  }
}
