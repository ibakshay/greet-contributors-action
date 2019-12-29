import octokit from './octokit'
import * as core from '@actions/core'
import {context} from '@actions/github'
import {CommittersDetails} from './interface'

export default async function getCommitters() {
  try {
    let committers: CommittersDetails[] = []
    let filteredCommitters: CommittersDetails[] = []
    let response = await octokit.graphql(
      `
        query($owner:String! $name:String! $number:Int! $cursor:String!){
            repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
                commits(first: 100, after: $cursor) {
                    totalCount
                    edges {
                        node {
                            commit {
                                author {
                                    email
                                    name
                                    user {
                                        id
                                        databaseId
                                        login
                                    }
                                }
                                committer {
                                    name
                                    user {
                                        id
                                        databaseId
                                        login
                                    }
                                }
                            }
                        }
                        cursor
                    }
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                }
            }
        }
    }`.replace(/ /g, ''),
      {
        owner: context.repo.owner,
        name: context.repo.repo,
        number: context.issue.number,
        cursor: ''
      }
    )
    response!.repository.pullRequest.commits.edges.forEach(edge => {
      let committer = extractUserFromCommit(edge.node.commit)
      let user = {
        name: committer.login || committer.name,
        id: committer.databaseId || '',
        pullRequestNo: context.issue.number
      }
      if (
        committers.length === 0 ||
        committers
          .map(c => {
            return c.name
          })
          .indexOf(user.name) < 0
      ) {
        committers.push(user)
      }
    })
    console.log('the committers of this pr are' + JSON.stringify(committers))
    filteredCommitters = committers.filter(committer => {
      return committer.id !== 41898282
    })
    console.log(
      'the committers last push of this pr are' +
        JSON.stringify(filteredCommitters)
    )
    return filteredCommitters
  } catch (e) {
    core.setFailed('graphql call to get the committers details failed:' + e)
  }
}
const extractUserFromCommit = commit =>
  commit.author.user ||
  commit.committer.user ||
  commit.author ||
  commit.committer